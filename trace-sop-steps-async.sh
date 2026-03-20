#!/bin/bash

###############################################################################
# Script: trace-sop-steps-async.sh
# Description: Interactive test script for async SOP step tracing
# Usage: ./trace-sop-steps-async.sh
#
# Flow:
#   1. Select a company from the list
#   2. Select an SOP from the company's SOPs
#   3. Trigger async analysis
#   4. Poll Level 1 tasks (Step -> ActivityEvent selection)
#   5. Poll Level 2 tasks (ActivityEvent -> LogLine matching)
#   6. Display results when complete
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"

# Global variables
COMPANY_ID=""
COMPANY_NAME=""
SOP_ID=""
SOP_NAME=""
CORRELATION_ID=""
STEP_IDS=()
STEP_NAMES=()
TASK_IDS=()

# Level 2: LogLine matching tasks (parallel arrays)
# Keys stored as "stepId:activityEventId"
LL_TASK_KEYS=()
LL_TASK_IDS=()
LL_AE_NAMES=()

# Check for jq dependency
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is required but not installed${NC}"
        echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
        exit 1
    fi
}

# Check if API is accessible
check_api() {
    echo -e "${BLUE}Checking API connectivity...${NC}"
    if ! curl -s -f "${API_BASE_URL}/api/company" > /dev/null 2>&1; then
        echo -e "${RED}Error: Cannot connect to API at ${API_BASE_URL}${NC}"
        echo "Make sure the application is running (./gradlew bootRun)"
        exit 1
    fi
    echo -e "${GREEN}API connectivity verified${NC}"
    echo ""
}

# Fetch and display company selection menu
select_company() {
    echo -e "${BLUE}Fetching companies...${NC}"

    local response=$(curl -s "${API_BASE_URL}/api/company")
    local count=$(echo "$response" | jq 'length')

    if [ "$count" -eq 0 ]; then
        echo -e "${RED}No companies found. Create a company first.${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Companies:${NC}"
    for i in $(seq 0 $((count - 1))); do
        local name=$(echo "$response" | jq -r ".[$i].name")
        echo -e "  $((i + 1))) $name"
    done
    echo ""

    # Read user selection
    local selection
    while true; do
        read -p "Select company [1-$count]: " selection
        if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "$count" ]; then
            break
        fi
        echo -e "${RED}Invalid selection. Please enter a number between 1 and $count${NC}"
    done

    local idx=$((selection - 1))
    COMPANY_ID=$(echo "$response" | jq -r ".[$idx].id")
    COMPANY_NAME=$(echo "$response" | jq -r ".[$idx].name")

    echo -e "${GREEN}Selected: $COMPANY_NAME${NC}"
    echo ""
}

# Fetch and display SOP selection menu
select_sop() {
    echo -e "${BLUE}Fetching SOPs for $COMPANY_NAME...${NC}"

    local response=$(curl -s "${API_BASE_URL}/api/sop?companyId=${COMPANY_ID}")
    local count=$(echo "$response" | jq 'length')

    if [ "$count" -eq 0 ]; then
        echo -e "${RED}No SOPs found for this company. Create an SOP first.${NC}"
        exit 1
    fi

    echo -e "${YELLOW}SOPs for $COMPANY_NAME:${NC}"
    for i in $(seq 0 $((count - 1))); do
        local name=$(echo "$response" | jq -r ".[$i].sopName")
        local step_count=$(echo "$response" | jq ".[$i].steps | length")
        echo -e "  $((i + 1))) $name ($step_count steps)"
    done
    echo ""

    # Read user selection
    local selection
    while true; do
        read -p "Select SOP [1-$count]: " selection
        if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "$count" ]; then
            break
        fi
        echo -e "${RED}Invalid selection. Please enter a number between 1 and $count${NC}"
    done

    local idx=$((selection - 1))
    SOP_ID=$(echo "$response" | jq -r ".[$idx].id")
    SOP_NAME=$(echo "$response" | jq -r ".[$idx].sopName")

    echo -e "${GREEN}Selected: $SOP_NAME${NC}"
    echo ""
}

# Trigger async analysis
trigger_async_trace() {
    echo -e "${BLUE}Triggering async analysis for: $SOP_NAME${NC}"

    # First, fetch SOP details to get step names
    local sop_response=$(curl -s "${API_BASE_URL}/api/sop/${SOP_ID}")

    local payload="{\"companyId\":\"${COMPANY_ID}\",\"sopId\":\"${SOP_ID}\"}"

    local response=$(curl -s -X POST "${API_BASE_URL}/api/analysis/trace-sop-steps/async" \
        -H "Content-Type: application/json" \
        -d "$payload")

    CORRELATION_ID=$(echo "$response" | jq -r '.correlationId')
    local task_count=$(echo "$response" | jq '.stepTaskMap | length')
    local message=$(echo "$response" | jq -r '.message')

    echo -e "Correlation ID: ${CYAN}$CORRELATION_ID${NC}"
    echo -e "$message"
    echo ""

    if [ "$task_count" -eq 0 ]; then
        echo -e "${YELLOW}No tasks created.${NC}"
        echo "This usually means no steps have an actorRoleTitle assigned,"
        echo "or Gemini activity event selection is disabled."
        exit 0
    fi

    # Parse stepTaskMap into arrays
    STEP_IDS=()
    TASK_IDS=()
    STEP_NAMES=()

    # Get step IDs and task IDs
    local step_task_pairs=$(echo "$response" | jq -r '.stepTaskMap | to_entries[] | "\(.key)|\(.value)"')

    while IFS='|' read -r step_id task_id; do
        STEP_IDS+=("$step_id")
        TASK_IDS+=("$task_id")
        # Get step name from SOP response
        local step_name=$(echo "$sop_response" | jq -r --arg sid "$step_id" '.steps[] | select(.id == $sid) | .name // "Unknown"')
        STEP_NAMES+=("$step_name")
    done <<< "$step_task_pairs"
}

# Helper: find index in LL_TASK_KEYS array
find_ll_task_index() {
    local key="$1"
    for i in "${!LL_TASK_KEYS[@]}"; do
        if [ "${LL_TASK_KEYS[$i]}" = "$key" ]; then
            echo "$i"
            return 0
        fi
    done
    echo "-1"
    return 1
}

# Poll Level 1 task status (Step -> ActivityEvent selection)
poll_level1_tasks() {
    local total=${#TASK_IDS[@]}
    echo -e "${BLUE}[Level 1] Polling ActivityEvent selection for $total steps...${NC}"
    echo ""

    local all_complete=false
    local first_poll_done=""

    while [ "$all_complete" = false ]; do
        all_complete=true
        local output=""

        for i in "${!TASK_IDS[@]}"; do
            local task_id="${TASK_IDS[$i]}"
            local step_id="${STEP_IDS[$i]}"

            # Fetch result (includes logLineMatchingTaskMap when complete)
            local result=$(curl -s "${API_BASE_URL}/api/analysis/trace-sop-steps/async/result?sopId=${SOP_ID}&stepId=${step_id}&taskId=${task_id}")
            local status=$(echo "$result" | jq -r '.status')

            # Format status with color
            local status_display=""
            case "$status" in
                "COMPLETED")
                    status_display="${GREEN}COMPLETED${NC}"
                    # Collect Level 2 tasks from logLineMatchingTaskMap
                    local log_task_map=$(echo "$result" | jq -r '.logLineMatchingTaskMap // {}')
                    if [ "$log_task_map" != "{}" ] && [ "$log_task_map" != "null" ]; then
                        # Parse each activityEventId -> taskId mapping using for loop (bash 3.x compatible)
                        local entries=$(echo "$log_task_map" | jq -r 'to_entries[] | "\(.key)=\(.value)"')
                        local old_ifs="$IFS"
                        IFS=$'\n'
                        for entry in $entries; do
                            IFS="$old_ifs"
                            local ae_id="${entry%%=*}"
                            local ll_task_id="${entry#*=}"
                            if [ -n "$ae_id" ] && [ -n "$ll_task_id" ]; then
                                local key="${step_id}:${ae_id}"
                                # Check if already added
                                local existing_idx=$(find_ll_task_index "$key")
                                if [ "$existing_idx" = "-1" ]; then
                                    # Get activity event name from stepTrace
                                    local ae_name=$(echo "$result" | jq -r --arg aeid "$ae_id" '.stepTrace.matchingActivityEvents[]? | select(.activityEvent.id == $aeid) | .activityEvent.name // "Unknown"')
                                    LL_TASK_KEYS+=("$key")
                                    LL_TASK_IDS+=("$ll_task_id")
                                    LL_AE_NAMES+=("$ae_name")
                                fi
                            fi
                            IFS=$'\n'
                        done
                        IFS="$old_ifs"
                    fi
                    ;;
                "FAILED")
                    status_display="${RED}FAILED${NC}"
                    ;;
                "PROCESSING")
                    status_display="${YELLOW}PROCESSING...${NC}"
                    all_complete=false
                    ;;
                "PENDING")
                    status_display="${CYAN}PENDING${NC}"
                    all_complete=false
                    ;;
                *)
                    status_display="$status"
                    all_complete=false
                    ;;
            esac

            # Truncate task ID and step name for display
            local short_task_id="${task_id:0:8}..."
            local step_name="${STEP_NAMES[$i]}"
            if [ ${#step_name} -gt 30 ]; then
                step_name="${step_name:0:27}..."
            fi
            output+="  [$step_name] $short_task_id: $status_display\n"
        done

        # Clear previous output and redraw
        if [ -n "$first_poll_done" ]; then
            for _ in $(seq 1 $total); do
                printf "\033[A\033[K"
            done
        fi
        first_poll_done=true

        printf "$output"

        if [ "$all_complete" = false ]; then
            sleep 1
        fi
    done

    echo ""
    echo -e "${GREEN}[Level 1] All ActivityEvent selection tasks complete!${NC}"
    echo -e "${CYAN}[Level 1] Collected ${#LL_TASK_KEYS[@]} Level 2 LogLine matching tasks${NC}"
    echo ""
}

# Poll Level 2 task status (ActivityEvent -> LogLine matching)
poll_level2_tasks() {
    local total=${#LL_TASK_KEYS[@]}

    if [ "$total" -eq 0 ]; then
        echo -e "${YELLOW}[Level 2] No LogLine matching tasks to poll${NC}"
        echo ""
        return
    fi

    echo -e "${MAGENTA}[Level 2] Polling LogLine matching for $total ActivityEvents...${NC}"
    echo ""

    local all_complete=false
    local first_poll_done=""

    while [ "$all_complete" = false ]; do
        all_complete=true
        local output=""

        for i in "${!LL_TASK_KEYS[@]}"; do
            local task_id="${LL_TASK_IDS[$i]}"
            local ae_name="${LL_AE_NAMES[$i]}"

            # Fetch LogLine matching result
            local result=$(curl -s "${API_BASE_URL}/api/analysis/trace-sop-steps/async/logline-result?taskId=${task_id}")
            local status=$(echo "$result" | jq -r '.status')

            # Format status with color
            local status_display=""
            case "$status" in
                "COMPLETED")
                    status_display="${GREEN}COMPLETED${NC}"
                    ;;
                "FAILED")
                    status_display="${RED}FAILED${NC}"
                    ;;
                "PROCESSING")
                    status_display="${YELLOW}PROCESSING...${NC}"
                    all_complete=false
                    ;;
                "PENDING")
                    status_display="${CYAN}PENDING${NC}"
                    all_complete=false
                    ;;
                *)
                    status_display="$status"
                    all_complete=false
                    ;;
            esac

            # Truncate activity event name if needed
            local display_name="$ae_name"
            if [ ${#display_name} -gt 25 ]; then
                display_name="${display_name:0:22}..."
            fi
            local short_task_id="${task_id:0:8}..."
            output+="  [${display_name}] $short_task_id: $status_display\n"
        done

        # Clear previous output and redraw
        if [ -n "$first_poll_done" ]; then
            for _ in $(seq 1 $total); do
                printf "\033[A\033[K"
            done
        fi
        first_poll_done=true

        printf "$output"

        if [ "$all_complete" = false ]; then
            sleep 1
        fi
    done

    echo ""
    echo -e "${GREEN}[Level 2] All LogLine matching tasks complete!${NC}"
    echo ""
}

# Helper: get LL task ID by key
get_ll_task_id() {
    local key="$1"
    local idx=$(find_ll_task_index "$key")
    if [ "$idx" != "-1" ]; then
        echo "${LL_TASK_IDS[$idx]}"
    fi
}

# Display results
display_results() {
    echo -e "${BLUE}=== RESULTS ===${NC}"
    echo ""

    for i in "${!TASK_IDS[@]}"; do
        local task_id="${TASK_IDS[$i]}"
        local step_id="${STEP_IDS[$i]}"

        # Fetch Level 1 result
        local result=$(curl -s "${API_BASE_URL}/api/analysis/trace-sop-steps/async/result?sopId=${SOP_ID}&stepId=${step_id}&taskId=${task_id}")

        local status=$(echo "$result" | jq -r '.status')
        local step_name=$(echo "$result" | jq -r '.stepTrace.step.name // "Unknown Step"')

        echo -e "${YELLOW}Step: $step_name${NC}"

        if [ "$status" = "FAILED" ]; then
            local error_msg=$(echo "$result" | jq -r '.message')
            echo -e "  ${RED}FAILED: $error_msg${NC}"
            echo ""
            continue
        fi

        if [ "$status" != "COMPLETED" ]; then
            echo -e "  ${YELLOW}Status: $status${NC}"
            echo ""
            continue
        fi

        # Parse matching activity events
        local ae_count=$(echo "$result" | jq '.stepTrace.matchingActivityEvents | length')

        if [ "$ae_count" -eq 0 ]; then
            echo -e "  ${CYAN}No matching ActivityEvents${NC}"
        else
            echo -e "  Selected ActivityEvents ($ae_count):"

            for j in $(seq 0 $((ae_count - 1))); do
                local ae_id=$(echo "$result" | jq -r ".stepTrace.matchingActivityEvents[$j].activityEvent.id")
                local ae_name=$(echo "$result" | jq -r ".stepTrace.matchingActivityEvents[$j].activityEvent.name")

                echo -e "    ${CYAN}- $ae_name${NC}"

                # Check if we have Level 2 LogLine task for this ActivityEvent
                local ll_task_key="${step_id}:${ae_id}"
                local ll_task_id=$(get_ll_task_id "$ll_task_key")

                if [ -n "$ll_task_id" ]; then
                    # Fetch Level 2 LogLine matching result
                    local ll_result=$(curl -s "${API_BASE_URL}/api/analysis/trace-sop-steps/async/logline-result?taskId=${ll_task_id}")
                    local ll_status=$(echo "$ll_result" | jq -r '.status')

                    if [ "$ll_status" = "COMPLETED" ]; then
                        local log_trace=$(echo "$ll_result" | jq '.logLineTrace.logLinesByLogId // {}')
                        if [ "$log_trace" != "null" ] && [ "$log_trace" != "{}" ]; then
                            local total_lines=$(echo "$log_trace" | jq '[.[] | length] | add // 0')
                            local log_count=$(echo "$log_trace" | jq 'keys | length')

                            echo -e "      ${GREEN}LogLines: $total_lines across $log_count log(s)${NC}"

                            # Show breakdown by log
                            echo "$log_trace" | jq -r 'to_entries[] | "        Log \(.key | .[0:8])...: \(.value | length) lines"' | while read -r line; do
                                echo -e "      $line"
                            done
                        else
                            echo -e "      ${YELLOW}No matching LogLines${NC}"
                        fi
                    elif [ "$ll_status" = "FAILED" ]; then
                        local ll_error=$(echo "$ll_result" | jq -r '.message // "Unknown error"')
                        echo -e "      ${RED}LogLine matching failed: $ll_error${NC}"
                    else
                        echo -e "      ${YELLOW}LogLine matching status: $ll_status${NC}"
                    fi
                else
                    # Fallback: show inline logLineTrace from Level 1 result if available
                    local log_trace=$(echo "$result" | jq ".stepTrace.matchingActivityEvents[$j].logLineTrace.logLinesByLogId // {}")
                    if [ "$log_trace" != "null" ] && [ "$log_trace" != "{}" ]; then
                        local log_line_count=$(echo "$log_trace" | jq '[.[] | length] | add // 0')
                        echo -e "      ${GREEN}LogLines (inline): $log_line_count${NC}"
                    else
                        echo -e "      ${YELLOW}No LogLine task available${NC}"
                    fi
                fi
            done
        fi

        echo ""
    done
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Async SOP Step Trace Test Script${NC}"
    echo -e "${BLUE}  (Two-Level Async Processing)${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    check_dependencies
    check_api
    select_company
    select_sop
    trigger_async_trace
    poll_level1_tasks
    poll_level2_tasks
    display_results

    echo -e "${GREEN}Done!${NC}"
}

main
