CREATE DATABASE  IF NOT EXISTS `grievance_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `grievance_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: grievance_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `complaint`
--

DROP TABLE IF EXISTS `complaint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `priority` enum('HIGH','LOW','MEDIUM') DEFAULT NULL,
  `sla_deadline` datetime(6) DEFAULT NULL,
  `status` enum('ASSIGNED','IN_PROGRESS','PENDING','RESOLVED') DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `assigned_officer_id` bigint DEFAULT NULL,
  `citizen_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1lpsnfj29b3g0c286uv610ypl` (`assigned_officer_id`),
  KEY `FKhwg0caus73di8h897xsoust1e` (`citizen_id`),
  CONSTRAINT `FK1lpsnfj29b3g0c286uv610ypl` FOREIGN KEY (`assigned_officer_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKhwg0caus73di8h897xsoust1e` FOREIGN KEY (`citizen_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint`
--

LOCK TABLES `complaint` WRITE;
/*!40000 ALTER TABLE `complaint` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_seq`
--

DROP TABLE IF EXISTS `complaint_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_seq`
--

LOCK TABLES `complaint_seq` WRITE;
/*!40000 ALTER TABLE `complaint_seq` DISABLE KEYS */;
INSERT INTO `complaint_seq` VALUES (1);
/*!40000 ALTER TABLE `complaint_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(2000) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `priority` varchar(255) NOT NULL,
  `sla_deadline` datetime(6) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `assigned_officer_id` bigint DEFAULT NULL,
  `citizen_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKiw7jtjbxqww6hgo4g35hhg6yt` (`assigned_officer_id`),
  KEY `FKes1g07iyxfav5p0a91a5jyeu2` (`citizen_id`),
  CONSTRAINT `FKes1g07iyxfav5p0a91a5jyeu2` FOREIGN KEY (`citizen_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKiw7jtjbxqww6hgo4g35hhg6yt` FOREIGN KEY (`assigned_officer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,'2026-04-17 14:09:26.432414','The streetlight near house 42 is not functioning.',12.9716,77.5946,'MEDIUM','2026-04-18 14:09:26.432414','PENDING','Streetlight Not Working',NULL,1),(2,'2026-04-17 14:25:17.045895','Pipe broken',NULL,NULL,'HIGH','2026-04-18 14:25:17.045895','PENDING','Water leakage',NULL,1),(3,'2026-04-17 14:34:46.607153','Waste is not Collecting properly',NULL,NULL,'HIGH','2026-04-18 14:34:46.607153','PENDING','Garbage Waste',NULL,1),(4,'2026-04-18 09:42:25.671953','Electric Wries are in improper order',NULL,NULL,'HIGH','2026-04-19 09:42:25.671953','PENDING','Electric Wires',NULL,1),(5,'2026-04-18 14:21:17.451983','Electric wires are in improper order',NULL,NULL,'HIGH','2026-04-19 14:21:17.451983','PENDING','Electric Wires',NULL,2),(6,'2026-04-20 10:24:19.177147','Bikers are riding very fast, to prevent accident.',12.9784,77.6408,'LOW','2026-04-21 10:24:19.177147','PENDING','Speed Breakers Requried',NULL,3),(7,'2026-04-20 10:57:49.672405','Reduce the no of Vehicle passage through our society road',12.9784,77.6408,'MEDIUM','2026-04-21 10:57:49.672405','PENDING','Traffic Management',NULL,8);
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','CITIZEN','OFFICER','SUPERVISOR') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'12 MG Road, Ward 8, Bengaluru','9876543210','2026-04-17 14:09:26.222042','asha.verma.smoke@example.com','Asha Verma','password123','CITIZEN'),(2,'Hyderabad, Telangana','9876543210','2026-04-18 14:04:47.928737','ravi@gmail.com','Ravi Kumar','1234','CITIZEN'),(3,'5/923, M.S.Nagar, Yemmiganur','7412589632','2026-04-20 10:15:35.104214','alpha@gmail.com','Alpha','alpha123','CITIZEN'),(4,'Main Administrative Office','9999999999','2026-04-20 10:30:25.000000','admin.aditya@gmail.com','System Admin','Admin@123','ADMIN'),(8,'5/923, M.S.Nagar, Yemmiganur','9894923074','2026-04-20 10:55:12.392499','sk@gmail.com','Suhaas ','sk131525','CITIZEN');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-20 10:59:56
