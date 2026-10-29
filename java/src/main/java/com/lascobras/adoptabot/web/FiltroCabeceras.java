package com.lascobras.adoptabot.web;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Cabeceras de seguridad básicas para todas las respuestas. */
@Component
public class FiltroCabeceras extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest peticion, HttpServletResponse respuesta, FilterChain cadena)
            throws ServletException, IOException {
        respuesta.setHeader("X-Content-Type-Options", "nosniff");
        respuesta.setHeader("X-Frame-Options", "DENY");
        respuesta.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        respuesta.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        cadena.doFilter(peticion, respuesta);
    }
}
