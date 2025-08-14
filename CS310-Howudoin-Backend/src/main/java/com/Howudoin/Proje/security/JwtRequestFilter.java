package com.Howudoin.Proje.security;

import org.springframework.beans.factory.annotation.Autowired; // Allows dependency injection for Spring components.
import org.springframework.stereotype.Component; // Marks this class as a Spring-managed component.
import org.springframework.web.filter.OncePerRequestFilter; // Ensures the filter is executed once per request.
import jakarta.servlet.FilterChain; // Provides the filter chain for processing the request.
import jakarta.servlet.ServletException; // Handles servlet-specific exceptions.
import jakarta.servlet.http.HttpServletRequest; // Represents the HTTP request object.
import jakarta.servlet.http.HttpServletResponse; // Represents the HTTP response object.
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // Authentication token used by Spring Security.
import org.springframework.security.core.context.SecurityContextHolder; // Manages the security context for the current thread.
import org.springframework.security.core.userdetails.User; // Provides a Spring Security user object.
import org.springframework.security.core.userdetails.UserDetails; // Represents user details used for authentication.

import java.io.IOException; // Handles I/O exceptions.
import java.util.ArrayList; // Provides a resizable array implementation.

@Component // Declares this class as a Spring component.
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired // Injects the JwtUtil dependency.
    private JwtUtil jwtUtil;

    // Filters incoming requests to validate and extract JWT details.
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization"); // Retrieves the Authorization header from the request.

        String email = null; // Holds the extracted email (subject) from the JWT.
        String jwt = null; // Holds the JWT token.

        // Checks if the Authorization header contains a Bearer token.
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // Extracts the token by removing the "Bearer " prefix.
            email = jwtUtil.extractUsername(jwt); // Extracts the username (email) from the token.
        }

        // Validates the token and ensures no authentication is already present in the security context.
        if (email != null && jwtUtil.validateToken(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Creates a UserDetails object with the extracted email and no roles.
            UserDetails userDetails = new User(email, "", new ArrayList<>());
            // Creates an authentication token with the UserDetails and its authorities.
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            // Sets the authentication token in the security context for the current thread.
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response); // Proceeds with the next filter in the chain.
    }
}