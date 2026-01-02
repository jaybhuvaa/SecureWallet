package com.securewallet.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class JwtTokenProvider {

  @Value("${securewallet.jwt.secret}")
  private String jwtSecret;

  @Value("${securewallet.jwt.access-token-expiration}")
  private long accessTokenExpiration;

  @Value("${securewallet.jwt.refresh-token-expiration}")
  private long refreshTokenExpiration;

  private SecretKey key;

  @PostConstruct
  public void init() {
    byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
    this.key = Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateAccessToken(UserPrincipal userPrincipal) {
    return generateToken(userPrincipal, accessTokenExpiration);
  }

  public String generateRefreshToken(UserPrincipal userPrincipal) {
    return generateToken(userPrincipal, refreshTokenExpiration);
  }

  public long getAccessTokenExpiration() {
    return accessTokenExpiration;
  }

  private String generateToken(UserPrincipal userPrincipal, long expiration) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expiration);

    Map<String, Object> claims = new HashMap<>();
    claims.put("roles", userPrincipal.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .collect(Collectors.toList()));
    claims.put("email", userPrincipal.getEmail());

    return Jwts.builder()
        .claims(claims)
        .subject(Long.toString(userPrincipal.getId()))
        .issuedAt(now)
        .expiration(expiryDate)
        .signWith(key)
        .compact();
  }

  public Long getUserIdFromToken(String token) {
    Claims claims = Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload();

    return Long.parseLong(claims.getSubject());
  }

  public boolean validateToken(String token) {
    try {
      Jwts.parser()
          .verifyWith(key)
          .build()
          .parseSignedClaims(token);
      return true;
    } catch (SecurityException ex) {
      log.error("Invalid JWT signature");
    } catch (MalformedJwtException ex) {
      log.error("Invalid JWT token");
    } catch (ExpiredJwtException ex) {
      log.error("Expired JWT token");
    } catch (UnsupportedJwtException ex) {
      log.error("Unsupported JWT token");
    } catch (IllegalArgumentException ex) {
      log.error("JWT claims string is empty");
    }
    return false;
  }
}