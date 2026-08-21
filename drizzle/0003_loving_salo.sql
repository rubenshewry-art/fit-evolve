CREATE TABLE `medicationApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`studentId` int NOT NULL,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`doseText` varchar(80),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medicationApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medicationEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`studentId` int NOT NULL,
	`eventType` enum('nausea','diarrhea','vomiting','constipation','abdominal_pain','other') NOT NULL,
	`severity` enum('mild','moderate','severe') NOT NULL DEFAULT 'mild',
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`needsProfessionalReview` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medicationEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medicationPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`medicationName` varchar(120) NOT NULL,
	`activeIngredient` varchar(120) NOT NULL,
	`therapeuticClass` varchar(120) NOT NULL,
	`indication` varchar(255),
	`prescriberName` varchar(160),
	`prescriptionDate` timestamp,
	`startDate` timestamp,
	`status` enum('active','paused','completed') NOT NULL DEFAULT 'active',
	`sourceUrl` text,
	`notes` text,
	`consentToShare` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicationPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint


