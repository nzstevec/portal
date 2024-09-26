#!/bin/bash
# Function to handle termination signals
term_handler() {
    echo "Termination signal received. Stopping background processes..."
    # Kill all child processes
    if [ -n "$child" ]; then
        kill -TERM "$child" 2>/dev/null
        wait "$child"
    fi
    exit 143  # 128 + 15 -- indicates SIGTERM
}

# Trap termination signals
trap 'term_handler' SIGTERM SIGINT

# Start the Flask app in the background
flask run --host=0.0.0.0 --port=8080 &
child=$!

# Start the Streamlit app
cd streamlit
streamlit run landing_page.py   --server.port 8501 --server.headless true

# Wait for the background process to finish
wait "$child"

# When the above command finishes, the script will continue here
echo "Background process terminated. Exiting start.sh script."