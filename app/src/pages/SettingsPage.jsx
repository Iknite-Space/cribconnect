import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import '../styles/SettingsPage.css';

function SettingsPage() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const [newPassword, setNewPassword] = useState('');

  return (
    
    <div className={`settings-container`}>
      <h2>{language === 'french' ? 'Paramètres' : 'Settings'}</h2>

      {/* Theme */}
      <label>
        {language === 'french' ? 'Thème:' : 'Theme:'}
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">{language === 'french' ? 'Clair' : 'Light'}</option>
          <option value="dark">{language === 'french' ? 'Sombre' : 'Dark'}</option>
        </select>
      </label>

      {/* Language */}
      <label>
        {language === 'french' ? 'Langue:' : 'Language:'}
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="english">English</option>
          <option value="french">Français</option>
        </select>
      </label>

      {/* Update Password */}
      <label>
        {language === 'french' ? 'Nouveau mot de passe:' : 'New password:'}
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={language === 'french' ? 'Entrez un nouveau mot de passe' : 'Enter new password'}
        />
      </label>
    </div>
  );
}

export default SettingsPage;
