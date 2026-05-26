package com.school.management.system.service.implementation;

import com.school.management.system.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@school-management.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        emailSender.send(message);
    }
    
    @Override
    public void sendCredentialsEmail(String to, String username, String password) {
        String subject = "Your School Management System Account Credentials";
        String text = "Hello,\n\nYour account has been created successfully.\n\n"
                + "Username: " + username + "\n"
                + "Password: " + password + "\n\n"
                + "Please change your password after your first login.\n\n"
                + "Regards,\nSchool Administration";
        sendSimpleMessage(to, subject, text);
    }
}