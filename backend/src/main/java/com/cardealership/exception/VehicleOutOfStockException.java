package com.cardealership.exception;

public class VehicleOutOfStockException extends RuntimeException {
    public VehicleOutOfStockException(String message) {
        super(message);
    }
}
