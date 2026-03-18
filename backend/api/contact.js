const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configuration de l'email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'votre-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'votre-mot-de-passe-app'
  }
});

// Route pour envoyer un email de contact
router.post('/send', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, email et message sont obligatoires'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Préparation de l'email pour l'admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'contact@ytech-ai.ma',
      subject: `Nouveau message de contact - ${subject || 'Sans sujet'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #6366f1; margin-bottom: 20px;">Nouveau Message de Contact</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">Informations du client</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #666; width: 120px;">Nom:</td>
                  <td style="padding: 8px; color: #333;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #666;">Email:</td>
                  <td style="padding: 8px; color: #333;">${email}</td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #666;">Téléphone:</td>
                  <td style="padding: 8px; color: #333;">${phone}</td>
                </tr>
                ` : ''}
                ${company ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #666;">Entreprise:</td>
                  <td style="padding: 8px; color: #333;">${company}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #666;">Sujet:</td>
                  <td style="padding: 8px; color: #333;">${subject || 'Non spécifié'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-bottom: 15px;">Message</h3>
              <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
              <p>Ce message a été envoyé depuis le formulaire de contact du site YTech AI</p>
              <p>Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })}</p>
            </div>
          </div>
        </div>
      `
    };

    // Préparation de l'email de confirmation pour le client
    const clientMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmation de réception - YTech AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">YTech AI</h1>
              <p style="color: #666; margin: 5px 0;">Solutions Digitales Innovantes</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Merci pour votre message!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Bon cher/chère ${name},<br><br>
              Nous avons bien reçu votre message et nous vous en remercions. 
              Notre équipe vous répondra dans les plus brefs délais.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">Récapitulatif de votre message</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #666; width: 120px;">Sujet:</td>
                  <td style="padding: 8px; color: #333;">${subject || 'Non spécifié'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #666; Message:</td>
                  <td style="padding: 8px; color: #333; font-style: italic;">${message.substring(0, 100)}${message.length > 100 ? '...' : ''}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ytech-ai.ma" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Visiter notre site
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 5px 0;">YTech AI - Contact</p>
              <p style="margin: 5px 0;">Email: contact@ytech-ai.ma</p>
              <p style="margin: 5px 0;">Tél: +212 5XX XXX XXX</p>
            </div>
          </div>
        </div>
      `
    };

    // Envoyer les deux emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(clientMailOptions);

    // Sauvegarder dans la base de données
    const contactMessage = {
      name,
      email,
      phone,
      company,
      subject,
      message,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    // Ici vous pouvez ajouter la sauvegarde en base de données
    // await db.collection('contacts').add(contactMessage);

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès! Vous recevrez une confirmation par email.'
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.'
    });
  }
});

// Route pour récupérer les messages (admin)
router.get('/messages', async (req, res) => {
  try {
    // Ici vous pouvez récupérer depuis la base de données
    // const messages = await db.collection('contacts').get();
    
    res.status(200).json({
      success: true,
      message: 'Messages récupérés avec succès',
      data: [] // Remplacer par les vraies données
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
});

module.exports = router;
