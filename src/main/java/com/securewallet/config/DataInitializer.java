package com.securewallet.config;

import com.securewallet.entity.Role;
import com.securewallet.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        if (roleRepository.count() == 0) {
            log.info("Initializing default roles...");

            roleRepository.save(Role.builder()
                    .name("ROLE_USER")
                    .description("Standard user role")
                    .build());

            roleRepository.save(Role.builder()
                    .name("ROLE_ADMIN")
                    .description("Administrator role")
                    .build());

            roleRepository.save(Role.builder()
                    .name("ROLE_MERCHANT")
                    .description("Merchant account role")
                    .build());

            log.info("Default roles created successfully");
        }
    }
}
