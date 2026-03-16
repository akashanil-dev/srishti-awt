-- Tech Event Database (Clean Schema + Seed Data)

CREATE DATABASE IF NOT EXISTS tech_event;
USE tech_event;

-- ========================
-- USERS
-- ========================
CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
role ENUM('user','admin') DEFAULT 'user',
phone VARCHAR(15) NOT NULL,
branch VARCHAR(50),
year_of_passing INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ========================
-- EVENTS
-- ========================
CREATE TABLE events (
id INT AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(200) NOT NULL,
description TEXT,
event_date DATE NOT NULL,
max_participants INT NOT NULL,
created_by INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
event_type VARCHAR(20) DEFAULT 'solo',
team_min INT,
team_max INT,
FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ========================
-- EVENT REGISTRATIONS
-- ========================
CREATE TABLE event_registrations (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
event_id INT NOT NULL,
registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE KEY unique_user_event (user_id,event_id),
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========================
-- TEAMS
-- ========================
CREATE TABLE teams (
id INT AUTO_INCREMENT PRIMARY KEY,
team_name VARCHAR(100) NOT NULL,
event_id INT,
created_by INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ========================
-- TEAM MEMBERS
-- ========================
CREATE TABLE team_members (
id INT AUTO_INCREMENT PRIMARY KEY,
team_id INT,
user_id INT,
role ENUM('leader','member') DEFAULT 'member',
UNIQUE KEY unique_team_user (team_id,user_id),
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ========================
-- USERS DATA
-- ========================
INSERT INTO users (id,name,email,password,role,phone,branch,year_of_passing) VALUES
(1,'Admin','[admin@test.com](mailto:admin@test.com)','$2y$12$f4BwWFfIBJjdxIsUc0aXeeouTYB0ZvBX3OKEbeeqc5eGaKLRe8Q7.','admin','9876543210',NULL,NULL),
(2,'John','[john@test.com](mailto:john@test.com)','123456','user','9123456780',NULL,NULL),
(3,'Alice','[alice@test.com](mailto:alice@test.com)','123456','user','9988776655','CSE',2026),
(4,'David','[david@test.com](mailto:david@test.com)','123456','user','9012345678','ECE',2025),
(5,'Mike','[mike@test.com](mailto:mike@test.com)','123456','user','9898989898','IT',2026),
(7,'Rahul','[rahul@test.com](mailto:rahul@test.com)','123456','user','9078563412',NULL,NULL),
(8,'Arjun','[arjun@test.com](mailto:arjun@test.com)','123456','user','9982345671',NULL,NULL),
(11,'John Doe','[john@example.com](mailto:john@example.com)','123456','user','9876543210',NULL,NULL),
(12,'Alex Johnson','[alex@test.com](mailto:alex@test.com)','$2y$10$QqQysQU9OVu/NH/M7F9couE9.D20QLE7b8nNfnt2oNre0lywS8eT6','user','9876543210','Computer Science',2026),
(14,'John Doe','[johndoe@test.com](mailto:johndoe@test.com)','$2y$10$VzH9DZWrvRFpJLjdwcIBM.PdFXEIQuD0Bh6/BDKz56jlyk56.3ip2','user','9876543210','Computer Science',2026),
(15,'Amal s kumar','[amal@ajce.in](mailto:amal@ajce.in)','$2y$12$f4BwWFfIBJjdxIsUc0aXeeouTYB0ZvBX3OKEbeeqc5eGaKLRe8Q7.','user','8590774603','MCA',2026),
(16,'Amal s kumar','[amals@ajce.in](mailto:amals@ajce.in)','$2y$12$FgfXhy5Z4ui2qKSbgUp7q.bS07I3E7HMEb3o2q9pvkQGx7C8JssNC','user','8590774603','B.Tech',2026);

-- ========================
-- EVENTS DATA
-- ========================
INSERT INTO events (id,title,description,event_date,max_participants,created_by,event_type,team_min,team_max) VALUES
(1,'AI & Machine Learning Workshop','Deep dive into neural networks and model training','2026-04-15',60,1,'solo',NULL,NULL),
(2,'Web Development Bootcamp','Full-stack web development crash course','2026-04-18',80,1,'solo',NULL,NULL),
(3,'Robotics Competition','Autonomous robot obstacle challenge','2026-04-20',100,1,'team',3,5),
(4,'Cybersecurity CTF Challenge','Capture the Flag security competition','2026-04-22',50,1,'team',2,4),
(5,'Cloud Computing Seminar','Serverless architecture and Kubernetes','2026-04-25',120,1,'solo',NULL,NULL),
(6,'Hackathon: Build for Good','24-hour hackathon focused on social impact','2026-05-01',150,1,'team',3,6),
(7,'Data Science with Python','Learn pandas, matplotlib and ML basics','2026-05-05',70,1,'solo',NULL,NULL),
(8,'UI/UX Design Sprint','Hands-on Figma and user research workshop','2026-05-08',40,1,'solo',NULL,NULL),
(9,'Competitive Programming Contest','Algorithmic challenges with live leaderboard','2026-05-10',200,1,'solo',NULL,NULL),
(10,'IoT & Embedded Systems Lab','Arduino and Raspberry Pi workshop','2026-05-12',45,1,'team',2,3),
(11,'Blockchain & Web3 Workshop','Write Solidity contracts and deploy dApps','2026-05-15',55,1,'solo',NULL,NULL),
(12,'Game Development Jam','48-hour Unity/Godot game jam','2026-05-18',80,1,'team',1,4);
