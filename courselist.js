document.addEventListener('DOMContentLoaded', function() {
    // Get the major from URL parameter (e.g., ?major=cs or ?major=ite)
    const urlParams = new URLSearchParams(window.location.search);
    const majorCode = urlParams.get('major') || 'cs'; // Default to CS if not specified
    const semesterParam = urlParams.get('semester') || 'summerOdd'; // Default to Summer Odd if not specified
    
    // Validate major code (only allow 'cs' or 'ite')
    const validMajor = ['cs', 'ite'].includes(majorCode) ? majorCode : 'cs';
    
    // Parse the semester parameter
    const semesterInfo = parseSemesterParam(semesterParam);
    
    // Keep track of which courses have been chosen
    let selectedItems = [];

    // Will track how many total courses we have
    let totalCourseCount = 0;
    
    // We'll treat the selected semester as index 0
    let currentSemesterIndex = 0;
    
    // Store database data globally
    let courseDatabase = {};
    let majorRequirements = {};
    let electiveCourses = {};
    
    // Fetch data from the server
    fetchDatabaseData();
    
    /**
     * Fetch course data from the PHP backend
     */
    function fetchDatabaseData() {
        fetch(`get_courses.php?major=${validMajor}`)
            .then(response => response.json())
            .then(data => {
                // Store data globally
                courseDatabase = data.courseDatabase;
                majorRequirements = data.majorRequirements;
                electiveCourses = data.electiveCourses;
                
                // Now that we have the data, initialize the page
                initializeCoursePlanner();
            })
            .catch(error => {
                console.error('Error fetching course data:', error);
                alert('Failed to load course data. Please try again later.');
            });
    }
    
    /**
     * Initialize the course planner after data is loaded
     */
    function initializeCoursePlanner() {
        // Update the page title to show the major and starting semester
        document.title = `${majorRequirements[validMajor].name} Course Planner - ${semesterInfo.displayName}`;
        
        // Update the heading to show the major
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = `${majorRequirements[validMajor].name} Course Planner - ${semesterInfo.displayName}`;
        }
        
        // Get the course codes for the selected major - handle both array and string formats
        const majorCourseCodes = Array.isArray(majorRequirements[validMajor].requiredCourses) 
            ? majorRequirements[validMajor].requiredCourses 
            : majorRequirements[validMajor].requiredCourses.split(', ');
            
        const container = document.getElementById('data-container');
        container.innerHTML = '';
        
        totalCourseCount = majorCourseCodes.length;
        
        // For each course in the major
        majorCourseCodes.forEach(code => {
            const course = courseDatabase[code];
            if (!course) return;
            
            const rowID = 'row-' + code.replace('/', '-');
            
            const row = document.createElement('tr');
            row.id = rowID;
            row.setAttribute('data-course', code);
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="course-checkbox"
                         name="selectedCourses[]"
                         value="${code}">
                    <label>${code} - ${course.title}</label>
                </td>
                <td class="credits-cell">${course.credits}</td>
            `;
            
            // Make row clickable only if it's not a selected course
            row.addEventListener('click', function(e) {
                if (!this.classList.contains('unavailable') && 
                    !this.classList.contains('selected-course') && 
                    e.target.type !== 'checkbox') {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    if (checkbox) checkbox.checked = !checkbox.checked;
                }
            });
            
            container.appendChild(row);
        });
        
        // Initial update of row states
        updateCourseRows();
        
        // Set the initial prompt
        document.getElementById('semester-prompt').textContent = "Select courses for " + getSemesterName(0);
        
        // Populate electives dropdown
        populateElectivesDropdown();
    }

    /**
     * Parse the semester parameter and return season and year information
     */
    function parseSemesterParam(param) {
        // Default values
        let result = {
            startSeason: 'Summer',
            isOddYear: true,
            displayName: 'Summer 2025'
        };
        
        // Convert camelCase to separate words
        const pattern = /([a-z])([A-Z])/g;
        const readableName = param.replace(pattern, '$1 $2');
        
        // Extract season and year type
        if (param.includes('summer')) {
            result.startSeason = 'Summer';
        } else if (param.includes('fall')) {
            result.startSeason = 'Fall';
        } else if (param.includes('spring')) {
            result.startSeason = 'Spring';
        }
        
        result.isOddYear = param.includes('Odd');
        
        // Set base year based on odd/even
        const baseYear = result.isOddYear ? 2025 : 2026;
        
        // Adjust year for Spring (which is in the following calendar year)
        const yearAdjust = (result.startSeason === 'Spring') ? 1 : 0;
        
        result.displayName = `${result.startSeason} ${baseYear + yearAdjust}`;
        
        return result;
    }
    
    /**
     * Dynamically generate semester names based on the starting semester
     */
    function getSemesterName(index) {
        // Define the sequence of seasons
        const seasons = ['Summer', 'Fall', 'Spring'];
        
        // Find the starting index in the seasons array
        let startSeasonIndex = seasons.indexOf(semesterInfo.startSeason);
        if (startSeasonIndex === -1) startSeasonIndex = 0; // Default to Summer if not found
        
        // Calculate the season for this index
        const seasonIndex = (startSeasonIndex + index) % 3;
        const season = seasons[seasonIndex];
        
        // Calculate how many years have passed
        const yearsPassed = Math.floor((startSeasonIndex + index) / 3);
        
        // Base year based on odd/even
        let baseYear = semesterInfo.isOddYear ? 2025 : 2026;
        
        // Adjust for Spring being in the next calendar year
        const displayYear = baseYear + yearsPassed + (season === 'Spring' ? 1 : 0);
        
        return `${season} ${displayYear}`;
    }

    const semesterIcons = {
        'Summer': 'sun.png',
        'Fall':   'leaf.png',
        'Spring': 'flower.png'
    };

    function getSemesterIcon(semesterName) {
        const [season] = semesterName.split(" ");
        return semesterIcons[season] || '';
    }

    /**
     * Check if all prerequisites for a course are met
     */
    function prereqsMet(courseCode) {
        // Get the course info from database
        const course = courseDatabase[courseCode];
        if (!course) return false;
        
        // If no prerequisites, always met
        if (!course.prereqs || course.prereqs.length === 0) return true;
        
        // Check if all prerequisites are in selectedItems
        return course.prereqs.every(prereq => selectedItems.includes(prereq));
    }

    /**
     * Check if a course is available in the current semester
     */
    function isAvailableInCurrentSemester(courseCode) {
        const course = courseDatabase[courseCode];
        if (!course) return false;
        
        // Get current semester name
        const semesterName = getSemesterName(currentSemesterIndex);
        const [season, year] = semesterName.split(' ');
        
        // Determine if we're in an odd or even year based on the semester
        const isOddYear = parseInt(year) % 2 === 1;
        const availabilityYear = isOddYear ? 'OddYear' : 'EvenYear';
        
        // Check if the course is available in this season
        return course.availableSemesters.includes(season) && 
               course.availableYears.includes(availabilityYear);
    }

    /**
     * Determine if a course can be taken this semester
     */
    function canTakeCourse(courseCode) {
        // If already chosen, no
        if (selectedItems.includes(courseCode)) return false;
        
        // For starting semester, allow any course with no prerequisites
        if (currentSemesterIndex === 0) {
            const course = courseDatabase[courseCode];
            return course && (!course.prereqs || course.prereqs.length === 0);
        }
        
        // Must meet prereqs and be available this semester
        return prereqsMet(courseCode) && isAvailableInCurrentSemester(courseCode);
    }

	// Handle Skip Semester button
	document.getElementById('skip-semester-btn').addEventListener('click', function() {
		// Create an empty semester section with the current semester name
		let semesterName = getSemesterName(currentSemesterIndex);
		let iconPath = getSemesterIcon(semesterName);
    
		const semesterSection = document.createElement('div');
		semesterSection.className = 'semester-section';
    
		const titleHtml = `
			<h4 class="semester-title">
				${iconPath ? `<img src="${iconPath}" alt="${semesterName} icon" class="semester-icon">` : ''}
				${semesterName}
			</h4>
		`;
		semesterSection.innerHTML = titleHtml;
    
		// Add "Empty Semester" text
		const emptyText = document.createElement('p');
		emptyText.textContent = "Empty Semester";
		emptyText.style.fontStyle = "italic";
		emptyText.style.color = "#777";
		semesterSection.appendChild(emptyText);
    
		// Add the semester section to the container
		document.getElementById('semester-container').appendChild(semesterSection);
    
		// Advance to the next semester
		currentSemesterIndex++;
    
		// Update row states for the next semester
		updateCourseRows();
    
		// Update the semester prompt for the next semester
		document.getElementById('semester-prompt').textContent = "Select courses for " + getSemesterName(currentSemesterIndex);
	});
	
    function updateCourseRows() {
        const rows = document.querySelectorAll('#data-container tr');
        
        rows.forEach(row => {
            const courseCode = row.getAttribute('data-course');

            // If it's already selected, mark green and remove checkbox
            if (selectedItems.includes(courseCode)) {
                row.classList.add('selected-course');
                row.classList.remove('unavailable');
                
                // Remove the checkbox and replace with a checkmark
                const checkboxCell = row.querySelector('td:first-child');
                const checkbox = checkboxCell.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    // Create checkmark icon to replace checkbox
                    const checkIcon = document.createElement('span');
                    checkIcon.innerHTML = '✓';
                    checkIcon.style.color = '#1e8f3d';
                    checkIcon.style.fontWeight = 'bold';
                    checkIcon.style.marginRight = '6px';
                    
                    // Replace checkbox with checkmark
                    checkbox.parentNode.replaceChild(checkIcon, checkbox);
                }
                
                // Make the row non-clickable for selection
                row.style.cursor = 'default';
                return;
            }

            // Decide if this course is enabled
            let isEnabled = canTakeCourse(courseCode);

            if (isEnabled) {
                row.classList.remove('unavailable');
                const checkbox = row.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.disabled = false;
                row.style.cursor = 'pointer';
            } else {
                row.classList.add('unavailable');
                const checkbox = row.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = false;
                    checkbox.disabled = true;
                }
                row.style.cursor = 'not-allowed';
            }
        });
    }

    // Handle form submission
    document.getElementById('course-form').addEventListener('submit', function(e) {
        e.preventDefault();

        // Find which courses are newly selected
        let newlySelected = [];
        const rows = document.querySelectorAll('#data-container tr');
        
        rows.forEach(row => {
            const courseCode = row.getAttribute('data-course');
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked && !selectedItems.includes(courseCode)) {
                newlySelected.push(courseCode);
            }
        });

        if (newlySelected.length > 0) {
            // Add them to selectedItems
            selectedItems = selectedItems.concat(newlySelected);

            // Build the semester section with icon
            let semesterName = getSemesterName(currentSemesterIndex);
            let iconPath = getSemesterIcon(semesterName);
            
            const semesterSection = document.createElement('div');
            semesterSection.className = 'semester-section';
            
            const titleHtml = `
                <h4 class="semester-title">
                    ${iconPath ? `<img src="${iconPath}" alt="${semesterName} icon" class="semester-icon">` : ''}
                    ${semesterName}
                </h4>
            `;
            semesterSection.innerHTML = titleHtml;
            
            newlySelected.forEach(code => {
                const course = courseDatabase[code];
                if (!course) return;
                
                const coursePara = document.createElement('p');
                coursePara.textContent = `${code} - ${course.title} (${course.credits} cr)`;
                semesterSection.appendChild(coursePara);
            });

            document.getElementById('semester-container').appendChild(semesterSection);

            // Advance to the next semester
            currentSemesterIndex++;
            
            // Re-check row states
            updateCourseRows();

            // Now decide whether all courses are chosen
            const availableRows = document.querySelectorAll('#data-container tr').length;
            const selectedRows = document.querySelectorAll('.selected-course').length;

            if (selectedRows === availableRows) {
                // All courses selected
                document.getElementById('semester-prompt').textContent = "You're all set!";
                // Create confetti celebration
                createConfetti();
            } else {
                // Otherwise, prompt for the next semester
                document.getElementById('semester-prompt').textContent = "Select courses for " + getSemesterName(currentSemesterIndex);
            }

        } else {
            alert('No new courses selected or none are available.');
        }
    });
    
    // Populate electives dropdown
    function populateElectivesDropdown() {
        const urlParams = new URLSearchParams(window.location.search);
        const majorCode = urlParams.get('major') || 'cs';
        const validMajor = ['cs', 'ite'].includes(majorCode) ? majorCode : 'cs';
        
        const electivesContainer = document.getElementById("electivesDropdown");
        if (!electivesContainer) return;
        
        // Get the appropriate electives for the major
        const majorElectives = electiveCourses[validMajor];
        if (!majorElectives) return;
        
        // Create header
        const header = document.createElement('h3');
        header.textContent = majorElectives.name;
        electivesContainer.appendChild(header);
        
        // Create elective items directly from the electiveCourses data
        majorElectives.courses.forEach(courseText => {
            const electiveItem = document.createElement('div');
            electiveItem.className = 'elective-item';
            
            // Create course title - display the entire text as stored in the database
            const courseTitle = document.createElement('span');
            courseTitle.className = 'elective-title';
            courseTitle.textContent = courseText;
            
            // Add elements to the item
            electiveItem.appendChild(courseTitle);
            
            // Add item to container
            electivesContainer.appendChild(electiveItem);
        });
    }
});

// Toggle the electives dropdown visibility
function toggleElectivesDropdown() {
    document.getElementById("electivesDropdown").classList.toggle("show-electives");
}

// Close the electives dropdown if clicked outside
window.onclick = function(event) {
    if (!event.target.matches('.electives-btn')) {
        const dropdown = document.getElementById("electivesDropdown");
        if (dropdown.classList.contains('show-electives')) {
            dropdown.classList.remove('show-electives');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
	const printButton = document.getElementById('print-plan-btn');
	if (printButton) {
		printButton.style.display = 'none';
		printButton.addEventListener('click', function() {
			printCoursePlan();
		});
		}
	});

// Confetti functions from confetti.txt
function createConfetti() {
	const printButton = document.getElementById('print-plan-btn');
	if (printButton) {
		printButton.style.display = 'block';
		}
  // Amount of confetti and colors
  const confettiCount = 150;
  const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
  const confettiContainer = document.createElement('div');
  
  // Spawn point of confetti container
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '1000';
  document.body.appendChild(confettiContainer);
  
  // Spawn confetti from the container
  for (let i = 0; i < confettiCount; i++) {
    createConfettiPiece(confettiContainer, colors);
  }
  
  // Delete confetti
  setTimeout(() => {
    document.body.removeChild(confettiContainer);
  }, 6000);
}

function createConfettiPiece(container, colors) {
  const confetti = document.createElement('div');
  
  // Randomized properties of pieces
  const size = Math.random() * 10 + 6;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const speed = Math.random() * 3 + 2;
  const rotation = Math.random() * 360;
  const rotationSpeed = (Math.random() - 0.5) * 10;
  
  // Confetti pieces style
  confetti.style.position = 'absolute';
  confetti.style.width = `${size}px`;
  confetti.style.height = `${size}px`;
  confetti.style.backgroundColor = color;
  confetti.style.left = `${left}%`;
  confetti.style.top = '-10px';
  confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
  confetti.style.opacity = Math.random() + 0.5;
  
  container.appendChild(confetti);
  
  // Animated fall
  let topPosition = -10;
  let currentRotation = rotation;
  
  const fall = setInterval(() => {
    topPosition += speed;
    currentRotation += rotationSpeed;
    
    confetti.style.top = `${topPosition}px`;
    confetti.style.transform = `rotate(${currentRotation}deg)`;
    
    // Drift because it's very necassary
    const horizontalPos = parseFloat(confetti.style.left);
    const drift = (Math.random() - 0.5) * 0.7;
    confetti.style.left = `${horizontalPos + drift}%`;
    
    // Delete confetti that falls off page immediatly
    if (topPosition > window.innerHeight) {
      clearInterval(fall);
      container.removeChild(confetti);
    }
  }, 20);
}

function printCoursePlan() {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Get the header and semester container content (no footer)
  const header = document.querySelector('.header').cloneNode(true);
  const semesterContainer = document.getElementById('semester-container').cloneNode(true);
  
  // Create print-friendly styles
  const printStyles = `
    <style>
      body {
        font-family: 'Roboto', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
      }
      
      .header {
        padding: 10px; 
        text-align: center;
        background: #092a6d;
        color: white;
        margin-bottom: 20px;
      }
      
      .header h1 {
        font-size: 24px;
        margin-bottom: 5px;
      }
      
      .header p {
        font-size: 16px;
        margin-top: 0;
      }
      
      .print-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .semester-section {
        margin-bottom: 20px;
        background: white;
        border-left: 5px solid #092a6d;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      
      .semester-title {
        font-weight: bold;
        font-size: 18px;
        color: #092a6d;
        margin-top: 0;
        display: flex;
        align-items: center;
      }
      
      .semester-icon {
        width: 24px;
        height: 24px;
        margin-right: 8px;
      }
      
      @media print {
        .semester-section {
          box-shadow: none;
          border: 1px solid #ccc;
          break-inside: avoid;
        }
        
        .header {
          background-color: #092a6d !important;
          color: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        /* Add some padding to the bottom */
        body {
          padding-bottom: 20px;
        }
      }
    </style>
  `;
  
  // Construct the print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Athens State University - Course Plan</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
      ${printStyles}
    </head>
    <body>
      ${header.outerHTML}
      <div class="print-container">
        <h2 style="text-align: center; color: #092a6d;">Your Course Plan</h2>
        ${semesterContainer.outerHTML}
      </div>
      <script>
        // Automatically print and then close the window when done
        window.onload = function() {
          setTimeout(function() {
            window.print();
            // Close the window after printing (or if user cancels)
            window.addEventListener('afterprint', function() {
              window.close();
            });
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}