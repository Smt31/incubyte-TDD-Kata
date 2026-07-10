package com.cardealership.controller;

import com.cardealership.model.User;
import com.cardealership.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterUserWithValidData() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "valid@example.com");
        request.put("password", "password123");
        request.put("name", "Valid User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value("valid@example.com"))
                .andExpect(jsonPath("$.name").value("Valid User"));
    }

    @Test
    void shouldRejectDuplicateEmail() throws Exception {
        // Save initial user
        User existingUser = User.builder()
                .email("duplicate@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("Existing User")
                .role("USER")
                .build();
        userRepository.save(existingUser);

        Map<String, String> request = new HashMap<>();
        request.put("email", "duplicate@example.com");
        request.put("password", "password123");
        request.put("name", "New User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already exists"));
    }

    @Test
    void shouldRejectBlankEmail() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", " ");
        request.put("password", "password123");
        request.put("name", "Name");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void shouldRejectInvalidEmailFormat() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "invalid-email");
        request.put("password", "password123");
        request.put("name", "Name");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").value("Email must be a valid email address"));
    }

    @Test
    void shouldRejectBlankPassword() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "valid@example.com");
        request.put("password", " ");
        request.put("name", "Name");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void shouldRejectShortPassword() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "valid@example.com");
        request.put("password", "12345"); // Short password (less than 6 chars)
        request.put("name", "Name");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").value("Password must be at least 6 characters long"));
    }

    @Test
    void shouldRejectBlankName() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "valid@example.com");
        request.put("password", "password123");
        request.put("name", " ");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").exists());
    }

    @Test
    void shouldAssignDefaultUSERRole() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "role@example.com");
        request.put("password", "password123");
        request.put("name", "Role User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void shouldHashPasswordBeforeSaving() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "hash@example.com");
        request.put("password", "myPlainPassword123");
        request.put("name", "Hash User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        Optional<User> userOptional = userRepository.findByEmail("hash@example.com");
        assertTrue(userOptional.isPresent());
        User savedUser = userOptional.get();

        assertNotEquals("myPlainPassword123", savedUser.getPassword());
        assertTrue(passwordEncoder.matches("myPlainPassword123", savedUser.getPassword()));
    }

    @Test
    void shouldNotReturnPasswordInResponse() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "nopass@example.com");
        request.put("password", "password123");
        request.put("name", "No Pass User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void shouldSaveUserInDatabase() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "db@example.com");
        request.put("password", "password123");
        request.put("name", "DB User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        assertTrue(userRepository.existsByEmail("db@example.com"));
    }

    @Test
    void shouldRejectEmptyRequestBody() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Request body is missing or empty"));
    }

    @Test
    void shouldRejectMalformedJSON() throws Exception {
        String malformedJson = "{email: 'test@example.com', password: 'password123'"; // Missing closing brace

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Malformed JSON request"));
    }

    @Test
    void shouldReturnValidationErrorsForInvalidInput() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "bademail");
        request.put("password", "short");
        request.put("name", "");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.password").exists())
                .andExpect(jsonPath("$.name").exists());
    }

    @Test
    void shouldReturnCorrectHttpStatusCodes() throws Exception {
        // Test 201 Created for success
        Map<String, String> request = new HashMap<>();
        request.put("email", "http@example.com");
        request.put("password", "password123");
        request.put("name", "HTTP User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Test 400 Bad Request for duplicate
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
