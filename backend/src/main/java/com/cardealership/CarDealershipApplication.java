package com.cardealership;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Car Dealership Inventory System.
 * A full-stack application providing RESTful APIs for managing
 * vehicle inventory with role-based access control.
 */
@SpringBootApplication
public class CarDealershipApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarDealershipApplication.class, args);
	}
}
