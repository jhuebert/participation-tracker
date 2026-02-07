# Participation Tracker

An interactive classroom tool designed to help teachers efficiently manage student participation during lessons. This application helps track who answers questions, who volunteers, and creates a fair selection process for classroom activities.

## What This Tool Does

This application assists teachers in several ways:

- **Fair Student Selection**: Randomly picks students to answer questions, ensuring everyone gets a chance based on their participation history
- **Attendance Tracking**: Easily mark which students are present in class each day
- **Performance Tracking**: Monitor how often students answer correctly, how many times they volunteer, and their overall participation
- **Multiple Class Management**: Create different class groups (like Period 1, Period 2, etc.) and manage each separately
- **Volunteer System**: Allow students to volunteer for questions they want to answer
- **Skip Management**: Set limits on how many times a student can skip answering before being selected
- **Leaderboard View**: See which students have participated the most and performed well
- **Two Display Modes**: Use in teacher mode for full controls or student mode for a large projector display

## Who This Is For

This tool is designed for teachers and instructors who want to:
- Ensure fair participation from all students
- Reduce classroom bias in selecting who answers questions
- Track student engagement and performance
- Easily manage multiple classes or groups

## Getting Started

### Option 1: Local Testing (No Setup Required)

1. Open the `src/index.html` file in any web browser
2. The application will start immediately
3. Create a class by entering class name and student names (one per line)
4. Start selecting students and tracking participation

### Option 2: Using Docker (Recommended)

#### Prerequisites
- Docker installed on your computer
- Docker Hub account (free)

#### Quick Start
```bash
# Pull the latest version from Docker Hub
docker pull jhuebert/participation-tracker:latest

# Run the application
docker run -p 80:80 jhuebert/participation-tracker:latest
```

#### Using Docker Compose
```bash
# Start the application
docker-compose up

# Stop the application
docker-compose down
```

### Option 3: Cloudflare Deployment

This application is designed to work behind Cloudflare's reverse proxy for secure, fast access.

1. **Deploy the Docker Image**
   - Push to the main branch of this GitHub repository
   - The workflow automatically builds and tags the latest version
   - Images are pushed to Docker Hub with semantic versioning

2. **Configure Cloudflare**
   - Set up a Cloudflare Worker or Pages deployment
   - Point to your Docker Hub image
   - Configure SSL and proxy settings

3. **Access Your Application**
   - Your application will be accessible via Cloudflare's secure domain
   - No additional configuration needed

## Versioning

The application uses semantic versioning (e.g., 1.0.0, 1.1.0, 1.1.4) to track releases:

- **1.x.x**: Major versions with significant new features
- **1.x.x**: Minor versions with new functionality but no breaking changes
- **1.x.x**: Patch versions with bug fixes and improvements

Each version is automatically tagged with:
- Full version (e.g., `1.0.0`)
- Major.minor version (e.g., `1.0`)
- Major version only (e.g., `1`)

This lets you pin to specific versions or update to the latest patch version.

## Updating to New Versions

When a new version is released:

1. **For Local Use**: Download the new `VERSION` file and rebuild
2. **For Docker**: Pull the new version tag from Docker Hub
   ```bash
   docker pull jhuebert/participation-tracker:1.0.0
   ```
3. **For Cloudflare**: The deployment will automatically use the latest version

## Customizing Your Settings

The application includes several settings you can adjust:

### Weighted Selection
- **Default**: Enabled
- **What it does**: Students who participate less frequently are more likely to be selected
- **Why you might disable it**: If you want completely random selection regardless of participation history

### Skip Limit
- **Default**: 3 skips per session
- **What it does**: Limits how many times a student can skip answering before they must answer
- **Adjustment**: Change the skip limit in the settings menu

### Reset Options
- **Reset Session Skips**: Clears the skip counter for all students in the current session
- **Reset Leaderboard**: Clears all performance statistics for a specific class

## Data Management

The application stores all your data locally in your browser. To backup or restore your data:

1. **Export Data**: Go to "Manage Classes" → "Export Data" to save all your class information
2. **Import Data**: Go to "Manage Classes" → "Import Data" to restore from a saved file
3. **Backup**: Save your exported data file regularly

## Tips for Best Use

1. **Open in Two Tabs**: Use one tab in "Teacher View" for full controls and another in "Student View" for the projector display
2. **Mark Attendance Daily**: Start each day by marking which students are present
3. **Track Participation**: Regularly check the leaderboard to see student engagement
4. **Use Skip Limits**: Prevent the same students from answering every question
5. **Export Regularly**: Save your data regularly to prevent loss

## Technical Details

### Building Your Own Version

If you want to build and deploy your own version:

1. Update the `VERSION` file with your desired version (e.g., `1.1.0`)
2. Build the Docker image locally:
   ```bash
   docker build -t jhuebert/participation-tracker:1.1.0 .
   ```
3. Push to Docker Hub:
   ```bash
   docker login
   docker push jhuebert/participation-tracker:1.1.0
   ```

### Continuous Deployment

This repository includes GitHub Actions that automatically build and deploy when you push to the main branch:

1. Configure Docker Hub credentials in GitHub repository settings (secrets: `DOCKER_USERNAME`, `DOCKER_TOKEN`)
2. Update the `VERSION` file
3. Commit and push to main branch
4. The workflow automatically builds and tags the image

## Support and Feedback

If you find bugs or have suggestions for improvements, feel free to:
- Open an issue in the GitHub repository
- Submit feature requests
- Share your classroom use cases

## License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute as needed for your classroom needs.
