# Use an official Python 3.9 image as a base
FROM python:3.9-slim

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file to the working directory
COPY backend/requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code to the working directory
COPY backend/ .

COPY frontend/build ../frontend/build

# Expose the port the application will run on
EXPOSE 5000

# Run the command to start the Flask development server
CMD ["flask", "run", "--host=0.0.0.0"]