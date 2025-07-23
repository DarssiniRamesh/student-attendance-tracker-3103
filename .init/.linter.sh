#!/bin/bash
cd /home/kavia/workspace/code-generation/student-attendance-tracker-3103/attendance_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

