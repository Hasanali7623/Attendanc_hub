package com.project.config;

import com.project.models.User;
import com.project.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");
        
        // NOTE: Test users are disabled. Use the registration API to create users.
        // To create an admin user manually:
        // 1. Register a user through /api/auth/register
        // 2. Update the role in the database: UPDATE users SET role='ADMIN' WHERE email='your@email.com'
        
        log.info("Data initialization completed! No test users created.");
        log.info("Use /api/auth/register to create new users.");
    }
}