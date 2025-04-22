-- Drop tables if they exist to avoid conflicts
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS majors;
DROP TABLE IF EXISTS electives;

-- Create courses table
CREATE TABLE courses (
    code VARCHAR(10) NOT NULL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    prereqs TEXT,
    availableSemesters TEXT NOT NULL,
    availableYears TEXT NOT NULL,
    credits INT NOT NULL
);

-- Create majors table
CREATE TABLE majors (
    major VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    requiredCourses TEXT NOT NULL
);

-- Create electives table
CREATE TABLE electives (
    major VARCHAR(10) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    courses TEXT NOT NULL
);

-- Insert courses data
INSERT INTO courses (code, title, prereqs, availableSemesters, availableYears, credits) VALUES
('MA 308', 'Discrete Math', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('MA 310', 'Linear Algebra', '', 'Fall, Summer', 'OddYear, EvenYear', 3),
('MA 321', 'Differential Equations', '', 'Spring', 'OddYear, EvenYear', 3),
('MA 331', 'Applied Probability and Statistics', 'MA 308', 'Fall, Spring', 'OddYear, EvenYear', 3),
('CS 307', 'Web Development', '', 'Spring', 'OddYear, EvenYear', 3),
('CS 309/L', 'Digital Logic Design', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 4),
('CS 310', 'Ethics of Computing', 'CS 317', 'Fall, Spring, Summer', 'OddYear, EvenYear', 1),
('CS 317', 'Computer Science', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('CS 318', 'Computer Science II', 'CS 317', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('CS 340', 'Assembly Language', 'CS 318', 'Spring, Summer', 'OddYear, EvenYear', 3),
('CS 372', 'Data Structures', 'CS 318', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('CS 414', 'Programming Language', 'CS 372', 'Fall', 'OddYear, EvenYear', 3),
('CS 415', 'Operating Systems', 'CS 340, CS 372', 'Spring', 'OddYear, EvenYear', 3),
('CS 451', 'Software Engineering', 'CS 372, MA 308', 'Fall, Summer', 'OddYear, EvenYear', 3),
('CS 452', 'Senior Project', 'CS 451', 'Fall, Spring', 'OddYear, EvenYear', 3),
('CS 472', 'Algorithm Analysis', 'CS 372, MA 308', 'Spring', 'OddYear, EvenYear', 3),
('CS E1', 'Elective 1', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('CS E2', 'Elective 2', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('CS E3', 'Elective 3', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('CS E4', 'Elective 4', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('CS E5', 'Elective 5', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('ITE 305/306', 'Networking', '', 'Fall, Summer', 'OddYear, EvenYear', 4),
('ITE 315', 'System Admin', '', 'Summer', 'OddYear, EvenYear', 3),
('ITE 321', 'System Analysis', '', 'Fall', 'OddYear, EvenYear', 3),
('ITE 327/L', 'Database Systems', 'CS 317', 'Fall, Summer', 'OddYear, EvenYear', 4),
('ITE 409/L', 'Network Security', 'ITE 307/308', 'Fall', 'OddYear, EvenYear', 4),
('ITE 420', 'Information Security', '', 'Spring, Summer', 'OddYear, EvenYear', 3),
('ITE 441', 'Systems Integration', 'ITE 321', 'Spring', 'OddYear, EvenYear', 3),
('ITE 450', 'Human-Computer Interaction', 'CS 318', 'Spring', 'OddYear, EvenYear', 3),
('ITE 451', 'Software Engineering', 'CS 372, MA 308', 'Fall, Summer', 'OddYear, EvenYear', 3),
('ITE 452', 'Senior Project', 'ITE 451', 'Fall, Spring', 'OddYear, EvenYear', 3),
('ITE E1', 'Elective 1', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('ITE E2', 'Elective 2', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('ITE E3', 'Elective 3', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('ITE E4', 'Elective 4', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3),
('ITE E5', 'Elective 5', '', 'Fall, Spring, Summer', 'OddYear, EvenYear', 3);

-- Insert majors data
INSERT INTO majors (major, name, requiredCourses) VALUES
('ite', 'Information Technology', 'MA 308, CS 309/L, CS 307, CS 310, CS 317, CS 318, CS 372, ITE 305/306, ITE 315, ITE 321, ITE 327/L, ITE 420, ITE 441, ITE 450, ITE 451, ITE 452, ITE E1, ITE E2, ITE E3, ITE E4, ITE E5'),
('cs', 'Computer Science', 'MA 308, MA 310, MA 321, MA 331, CS 309/L, CS 310, CS 317, CS 318, CS 340, CS 372, CS 414, CS 415, CS 451, CS 452, CS 472, ITE 305/306, ITE 327/L, ITE 420, CS E1, CS E2, CS E3, CS E4, CS E5');

-- Insert electives data
INSERT INTO electives (major, name, courses) VALUES
('ite', 'Information Technology Electives', 'ITE307 - Wide Area Networks, ITE308 - Network Architectures, ITE365 - Visual Application Development, ITE367 - Enterprise Application Development, ITE382 - Mobile Device Development, ITE405 - Internetworking Devices, ITE406 - The Internet, ITE407 - Network Processes and Protocols, ITE408 - Enterprise Networking Design, ITE421 - Fundamentals of Information Security'),
('cs', 'Computer Science Electives', 'CS307 - Foundations of Web Development, CS365 - Visual Application Development, CS367 - Enterprise Application Development, CS380 - Web Application Development, CS382 - Mobile Device Development, CS385 - Pragmatic Artificial Intelligence, CS409 - Computer Organization and Architecture, CS418 - Advanced Object Oriented Applications, CS423 - Principles of Computer Graphics, CS475 - Theory of Computing, CS484 - Applied Cryptography, CS485 - Modern Artificial Intelligence, CS486 - Natural Language Processing');
