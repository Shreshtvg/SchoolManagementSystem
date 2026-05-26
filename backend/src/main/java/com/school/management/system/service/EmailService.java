package com.school.management.system.service;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);
    void sendCredentialsEmail(String to, String username, String password);
}