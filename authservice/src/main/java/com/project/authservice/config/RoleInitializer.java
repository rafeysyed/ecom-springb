package com.project.authservice.config;

import com.project.authservice.entity.Role;
import com.project.authservice.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {

        if(roleRepository.findByRoleName("ROLE_USER").isEmpty()){

            Role userRole = new Role();
            userRole.setRoleName("ROLE_USER");

            roleRepository.save(userRole);
        }

        if(roleRepository.findByRoleName("ROLE_ADMIN").isEmpty()){

            Role adminRole =  new Role();
            adminRole.setRoleName("ROLE_ADMIN");

            roleRepository.save(adminRole);
        }
    }
}
