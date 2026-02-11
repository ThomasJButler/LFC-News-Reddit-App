#!/bin/bash
# Usage: ./loop.sh [mode] [max_iterations]
# Examples:
#   ./loop.sh              # Build mode, unlimited iterations
#   ./loop.sh 20           # Build mode, max 20 iterations
#   ./loop.sh plan         # Plan mode, unlimited iterations
#   ./loop.sh plan 5       # Plan mode, max 5 iterations
#   ./loop.sh both 10      # Plan + Build in parallel, max 10 iterations each

CURRENT_BRANCH=$(git branch --show-current)
CLAUDE_BIN="${CLAUDE_BIN:-$(command -v claude 2>/dev/null || echo "$HOME/.claude/local/claude")}"
LOG_DIR="logs"

# ── Git push with rebase retry ───────────────────────────────────────
git_push() {
    local label="$1"
    for attempt in 1 2 3; do
        git push origin "$CURRENT_BRANCH" 2>/dev/null && return 0
        echo "[$label] Push attempt $attempt failed, pulling with rebase..."
        git pull --rebase origin "$CURRENT_BRANCH" 2>/dev/null
    done
    echo "[$label] Creating remote branch..."
    git push -u origin "$CURRENT_BRANCH"
}

# ── Single-mode loop ────────────────────────────────────────────────
run_loop() {
    local label="$1"
    local prompt_file="$2"
    local max="$3"
    local log_file="$4"
    local iteration=0

    while true; do
        if [ "$max" -gt 0 ] && [ "$iteration" -ge "$max" ]; then
            echo "[$label] Reached max iterations: $max"
            break
        fi

        iteration=$((iteration + 1))
        echo ""
        echo "======================== $label ITERATION $iteration ========================"
        echo ""

        cat "$prompt_file" | "$CLAUDE_BIN" -p \
            --dangerously-skip-permissions \
            --output-format=stream-json \
            --model opus \
            --verbose

        git_push "$label"

        echo ""
        echo "======================== $label $iteration COMPLETE ========================"
        echo ""
    done
}

# ── Parse arguments ──────────────────────────────────────────────────
case "$1" in
    plan)
        MODE="plan"
        MAX_ITERATIONS=${2:-0}
        ;;
    both)
        MODE="both"
        MAX_ITERATIONS=${2:-0}
        ;;
    [0-9]*)
        MODE="build"
        MAX_ITERATIONS=$1
        ;;
    *)
        MODE="build"
        MAX_ITERATIONS=0
        ;;
esac

# ── Banner ───────────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AiTomatic Ralph Loop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Mode:   $MODE"
echo "Branch: $CURRENT_BRANCH"
[ "$MAX_ITERATIONS" -gt 0 ] && echo "Max:    $MAX_ITERATIONS iterations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Verify prompt files ──────────────────────────────────────────────
if [ "$MODE" = "both" ] || [ "$MODE" = "plan" ]; then
    if [ ! -f "PROMPT_plan.md" ]; then
        echo "Error: PROMPT_plan.md not found"
        exit 1
    fi
fi
if [ "$MODE" = "both" ] || [ "$MODE" = "build" ]; then
    if [ ! -f "PROMPT_build.md" ]; then
        echo "Error: PROMPT_build.md not found"
        exit 1
    fi
fi

# Note: shadcn reference available in ui/ folder
if [ -f "ui/package.json" ] && [ ! -d "ui/node_modules" ]; then
    echo "Tip: Run 'cd ui && pnpm install' for component reference"
fi

# ── Run ──────────────────────────────────────────────────────────────
mkdir -p "$LOG_DIR"

if [ "$MODE" = "both" ]; then
    echo "Starting PLAN + BUILD in parallel..."
    echo "Logs: $LOG_DIR/plan.log, $LOG_DIR/build.log"
    echo ""

    run_loop "PLAN"  "PROMPT_plan.md"  "$MAX_ITERATIONS" "$LOG_DIR/plan.log"  > >(tee "$LOG_DIR/plan.log")  2>&1 &
    PLAN_PID=$!

    run_loop "BUILD" "PROMPT_build.md" "$MAX_ITERATIONS" "$LOG_DIR/build.log" > >(tee "$LOG_DIR/build.log") 2>&1 &
    BUILD_PID=$!

    # Wait for both and capture exit codes
    wait $PLAN_PID
    PLAN_EXIT=$?
    wait $BUILD_PID
    BUILD_EXIT=$?

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Both loops finished"
    echo "  PLAN  exit: $PLAN_EXIT"
    echo "  BUILD exit: $BUILD_EXIT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

elif [ "$MODE" = "plan" ]; then
    run_loop "PLAN" "PROMPT_plan.md" "$MAX_ITERATIONS" | tee "$LOG_DIR/plan.log"

else
    run_loop "BUILD" "PROMPT_build.md" "$MAX_ITERATIONS" | tee "$LOG_DIR/build.log"
fi
