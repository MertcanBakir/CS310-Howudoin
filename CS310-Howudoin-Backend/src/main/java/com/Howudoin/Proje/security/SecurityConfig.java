package com.Howudoin.Proje.security;

import org.springframework.context.annotation.Bean; // Imports for defining a bean in the application context.
import org.springframework.context.annotation.Configuration; // Marks this class as a configuration class.
import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Provides security configuration options.
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Enables web security for the application.
import org.springframework.security.web.SecurityFilterChain; // Represents the chain of security filters.
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // Base class for username-password based authentication filters.

@Configuration // Declares this class as a configuration class for Spring.
@EnableWebSecurity // Enables Spring Security for the application.
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter; // Custom filter for processing JWT tokens.

    // Constructor to inject the JwtRequestFilter dependency.
    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter; // Assigns the injected JwtRequestFilter.
    }

    @Bean // Defines the security filter chain as a Spring Bean.
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorizeRequests -> // Configures request authorization rules.
                        authorizeRequests
                                .requestMatchers("/register", "/login").permitAll() // Allows unauthenticated access to /register and /login endpoints.
                                .anyRequest().authenticated() // Requires authentication for all other requests.
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class) // Adds the JWT filter before the default authentication filter.
                .csrf(csrf -> csrf.disable()) // Disables Cross-Site Request Forgery (CSRF) protection.
                .httpBasic(httpBasic -> httpBasic.disable()) // Disables HTTP Basic authentication.
                .formLogin(formLogin -> formLogin.disable()); // Disables form-based login.

        return http.build(); // Builds and returns the security filter chain.
    }
}