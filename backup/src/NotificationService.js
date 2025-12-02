/**
 * Sistema de Notificaciones para Respaldos
 * 
 * Esta clase maneja el envío de notificaciones sobre el estado de los respaldos:
 * - Notificaciones por email (SMTP)
 * - Notificaciones por Slack (webhooks)
 * - Plantillas personalizables
 * - Filtrado de notificaciones por severidad
 */

const nodemailer = require('nodemailer');
const https = require('https');
const http = require('http');
const { URL } = require('url');
 
class NotificationService {
  constructor(config) {
    this.config = config;
    this.emailTransporter = null;
    this.templates = this.loadTemplates();
   
    this.initializeEmailTransporter();
  }
 
  /**
   * Inicializa el transportador de email
   */
  async initializeEmailTransporter() {
    if (!this.config.email.enabled) {
      return;
    }
 
    try {
      this.emailTransporter = nodemailer.createTransporter({
        host: this.config.email.smtp.host,
        port: this.config.email.smtp.port,
        secure: this.config.email.smtp.secure,
        auth: {
          user: this.config.email.smtp.auth.user,
          pass: this.config.email.smtp.auth.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
 
      // Verificar conexión
      await this.emailTransporter.verify();
      console.log('Transportador de email inicializado correctamente');
     
    } catch (error) {
      console.error('Error inicializando transportador de email:', error);
      this.emailTransporter = null;
    }
  }
 
  /**
   * Carga las plantillas de notificación
   * @returns {Object} Plantillas de notificación
   */
  loadTemplates() {
    return {
      email: {
        success: {
          subject: '✅ Respaldo Exitoso - {{backupId}}',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                <h1>✅ Respaldo Completado Exitosamente</h1>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2>Detalles del Respaldo</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>ID del Respaldo:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{backupId}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Fecha y Hora:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{timestamp}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Formato:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{format}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Tamaño:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{size}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Duración:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{duration}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Verificación:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{verification}}</td>
                  </tr>
                </table>
                {{#if collections}}
                <h3>Colecciones Respaldadas</h3>
                <ul>
                  {{#each collections}}
                  <li>{{this.name}} ({{this.size}} bytes)</li>
                  {{/each}}
                </ul>
                {{/if}}
              </div>
              <div style="padding: 20px; background-color: #e8f5e8; text-align: center;">
                <p>Este respaldo se ha almacenado de forma segura y está listo para su uso.</p>
              </div>
            </div>
          `
        },
        error: {
          subject: '❌ Error en Respaldo - {{backupId}}',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
                <h1>❌ Error en Respaldo</h1>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2>Detalles del Error</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>ID del Respaldo:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{backupId}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Fecha y Hora:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{timestamp}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Error:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #f44336;">{{error}}</td>
                  </tr>
                </table>
                {{#if stack}}
                <h3>Stack Trace</h3>
                <pre style="background-color: #f5f5f5; padding: 10px; overflow-x: auto; font-size: 12px;">{{stack}}</pre>
                {{/if}}
              </div>
              <div style="padding: 20px; background-color: #ffebee; text-align: center;">
                <p><strong>Acción Requerida:</strong> Por favor revise la configuración del sistema de respaldo y corrija el error.</p>
              </div>
            </div>
          `
        },
        warning: {
          subject: '⚠️ Advertencia en Respaldo - {{backupId}}',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #ff9800; color: white; padding: 20px; text-align: center;">
                <h1>⚠️ Advertencia en Respaldo</h1>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2>Detalles de la Advertencia</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>ID del Respaldo:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{backupId}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Fecha y Hora:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{timestamp}}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Advertencia:</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #ff9800;">{{warning}}</td>
                  </tr>
                </table>
                {{#if details}}
                <h3>Detalles Adicionales</h3>
                <p>{{details}}</p>
                {{/if}}
              </div>
              <div style="padding: 20px; background-color: #fff3e0; text-align: center;">
                <p>El respaldo se completó pero con advertencias. Se recomienda revisar la configuración.</p>
              </div>
            </div>
          `
        }
      },
      slack: {
        success: {
          color: 'good',
          title: '✅ Respaldo Exitoso',
          text: 'Respaldo completado exitosamente',
          fields: [
            { title: 'ID del Respaldo', value: '{{backupId}}', short: true },
            { title: 'Formato', value: '{{format}}', short: true },
            { title: 'Tamaño', value: '{{size}}', short: true },
            { title: 'Duración', value: '{{duration}}', short: true }
          ]
        },
        error: {
          color: 'danger',
          title: '❌ Error en Respaldo',
          text: 'Error durante el proceso de respaldo',
          fields: [
            { title: 'ID del Respaldo', value: '{{backupId}}', short: true },
            { title: 'Error', value: '{{error}}', short: false }
          ]
        },
        warning: {
          color: 'warning',
          title: '⚠️ Advertencia en Respaldo',
          text: 'Respaldo completado con advertencias',
          fields: [
            { title: 'ID del Respaldo', value: '{{backupId}}', short: true },
            { title: 'Advertencia', value: '{{warning}}', short: false }
          ]
        }
      }
    };
  }
 
  /**
   * Envía notificación de respaldo exitoso
   * @param {Object} backupResult - Resultado del respaldo
   */
  async sendSuccessNotification(backupResult) {
    const data = {
      backupId: backupResult.id || 'N/A',
      timestamp: new Date(backupResult.timestamp).toLocaleString(),
      format: backupResult.format || 'N/A',
      size: this.formatBytes(backupResult.size || 0),
      duration: this.formatDuration(backupResult.duration || 0),
      verification: backupResult.verified ? '✅ Verificado' : '⚠️ No verificado',
      collections: backupResult.collections || []
    };
 
    await Promise.all([
      this.sendEmailNotification('success', data),
      this.sendSlackNotification('success', data)
    ]);
  }
 
  /**
   * Envía notificación de error en respaldo
   * @param {Error} error - Error ocurrido
   * @param {string} backupId - ID del respaldo
   */
  async sendErrorNotification(error, backupId) {
    const data = {
      backupId: backupId || 'N/A',
      timestamp: new Date().toLocaleString(),
      error: error.message || 'Error desconocido',
      stack: error.stack || ''
    };
 
    await Promise.all([
      this.sendEmailNotification('error', data),
      this.sendSlackNotification('error', data)
    ]);
  }
 
  /**
   * Envía notificación de advertencia
   * @param {string} warning - Mensaje de advertencia
   * @param {string} backupId - ID del respaldo
   * @param {string} details - Detalles adicionales
   */
  async sendWarningNotification(warning, backupId, details = '') {
    const data = {
      backupId: backupId || 'N/A',
      timestamp: new Date().toLocaleString(),
      warning: warning,
      details: details
    };
 
    await Promise.all([
      this.sendEmailNotification('warning', data),
      this.sendSlackNotification('warning', data)
    ]);
  }
 
  /**
   * Envía notificación por email
   * @param {string} type - Tipo de notificación (success, error, warning)
   * @param {Object} data - Datos para la plantilla
   */
  async sendEmailNotification(type, data) {
    if (!this.config.email.enabled || !this.emailTransporter) {
      return;
    }
 
    try {
      const template = this.templates.email[type];
      if (!template) {
        throw new Error(`Plantilla de email no encontrada: ${type}`);
      }
 
      const subject = this.renderTemplate(template.subject, data);
      const html = this.renderTemplate(template.html, data);
 
      const mailOptions = {
        from: this.config.email.from,
        to: this.config.email.to.join(', '),
        subject: subject,
        html: html
      };
 
      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email enviado exitosamente: ${result.messageId}`);
     
    } catch (error) {
      console.error('Error enviando email:', error);
    }
  }
 
  /**
   * Envía notificación por Slack
   * @param {string} type - Tipo de notificación (success, error, warning)
   * @param {Object} data - Datos para la plantilla
   */
  async sendSlackNotification(type, data) {
    if (!this.config.slack.enabled || !this.config.slack.webhook) {
      return;
    }
 
    try {
      const template = this.templates.slack[type];
      if (!template) {
        throw new Error(`Plantilla de Slack no encontrada: ${type}`);
      }
 
      const attachment = {
        color: template.color,
        title: this.renderTemplate(template.title, data),
        text: this.renderTemplate(template.text, data),
        fields: template.fields.map(field => ({
          title: field.title,
          value: this.renderTemplate(field.value, data),
          short: field.short
        })),
        ts: Math.floor(Date.now() / 1000)
      };
 
      const payload = {
        channel: this.config.slack.channel,
        username: 'Sistema de Respaldo',
        icon_emoji: ':floppy_disk:',
        attachments: [attachment]
      };
 
      await this.sendSlackWebhook(payload);
      console.log('Notificación de Slack enviada exitosamente');
     
    } catch (error) {
      console.error('Error enviando notificación de Slack:', error);
    }
  }
 
  /**
   * Envía webhook a Slack
   * @param {Object} payload - Payload del webhook
   */
  async sendSlackWebhook(payload) {
    return new Promise((resolve, reject) => {
      const webhookUrl = new URL(this.config.slack.webhook);
      const postData = JSON.stringify(payload);
 
      const options = {
        hostname: webhookUrl.hostname,
        port: webhookUrl.port || (webhookUrl.protocol === 'https:' ? 443 : 80),
        path: webhookUrl.pathname + webhookUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
 
      const protocol = webhookUrl.protocol === 'https:' ? https : http;
      const req = protocol.request(options, (res) => {
        let data = '';
       
        res.on('data', (chunk) => {
          data += chunk;
        });
       
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`Slack webhook falló: ${res.statusCode} ${data}`));
          }
        });
      });
 
      req.on('error', (error) => {
        reject(error);
      });
 
      req.write(postData);
      req.end();
    });
  }
 
  /**
   * Renderiza una plantilla con datos
   * @param {string} template - Plantilla
   * @param {Object} data - Datos para reemplazar
   * @returns {string} Plantilla renderizada
   */
  renderTemplate(template, data) {
    let rendered = template;
 
    // Reemplazar variables simples {{variable}}
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
 
    // Manejar condicionales simples {{#if variable}}...{{/if}}
    rendered = rendered.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
      return data[key] ? content : '';
    });
 
    // Manejar loops simples {{#each array}}...{{/each}}
    rendered = rendered.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, content) => {
      const array = data[key];
      if (!Array.isArray(array)) return '';
     
      return array.map(item => {
        let itemContent = content;
        // Reemplazar {{this.property}} con propiedades del item
        itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (itemMatch, prop) => {
          return item[prop] !== undefined ? item[prop] : itemMatch;
        });
        return itemContent;
      }).join('');
    });
 
    return rendered;
  }
 
  /**
   * Formatea bytes en formato legible
   * @param {number} bytes - Número de bytes
   * @returns {string} Tamaño formateado
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
   
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
   
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
 
  /**
   * Formatea duración en formato legible
   * @param {number} milliseconds - Duración en milisegundos
   * @returns {string} Duración formateada
   */
  formatDuration(milliseconds) {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
   
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
   
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
 
  /**
   * Envía notificación de resumen diario
   * @param {Object} summary - Resumen de respaldos del día
   */
  async sendDailySummary(summary) {
    const data = {
      date: new Date().toLocaleDateString(),
      totalBackups: summary.total || 0,
      successfulBackups: summary.successful || 0,
      failedBackups: summary.failed || 0,
      totalSize: this.formatBytes(summary.totalSize || 0),
      averageDuration: this.formatDuration(summary.averageDuration || 0)
    };
 
    const template = {
      subject: '📊 Resumen Diario de Respaldos - {{date}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
            <h1>📊 Resumen Diario de Respaldos</h1>
            <p>{{date}}</p>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Estadísticas del Día</h2>
            <div style="display: flex; justify-content: space-around; text-align: center;">
              <div style="background-color: #4CAF50; color: white; padding: 15px; border-radius: 5px; margin: 5px;">
                <h3>{{successfulBackups}}</h3>
                <p>Exitosos</p>
              </div>
              <div style="background-color: #f44336; color: white; padding: 15px; border-radius: 5px; margin: 5px;">
                <h3>{{failedBackups}}</h3>
                <p>Fallidos</p>
              </div>
              <div style="background-color: #2196F3; color: white; padding: 15px; border-radius: 5px; margin: 5px;">
                <h3>{{totalBackups}}</h3>
                <p>Total</p>
              </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Tamaño Total:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{totalSize}}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Duración Promedio:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{{averageDuration}}</td>
              </tr>
            </table>
          </div>
        </div>
      `
    };
 
    if (this.config.email.enabled && this.emailTransporter) {
      try {
        const subject = this.renderTemplate(template.subject, data);
        const html = this.renderTemplate(template.html, data);
 
        await this.emailTransporter.sendMail({
          from: this.config.email.from,
          to: this.config.email.to.join(', '),
          subject: subject,
          html: html
        });
      } catch (error) {
        console.error('Error enviando resumen diario por email:', error);
      }
    }
  }
 
  /**
   * Prueba las configuraciones de notificación
   * @returns {Promise<Object>} Resultado de las pruebas
   */
  async testNotifications() {
    const results = {
      email: { enabled: this.config.email.enabled, success: false, error: null },
      slack: { enabled: this.config.slack.enabled, success: false, error: null }
    };
 
    // Probar email
    if (this.config.email.enabled && this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: this.config.email.from,
          to: this.config.email.to[0],
          subject: '🧪 Prueba de Notificación - Sistema de Respaldo',
          html: '<p>Esta es una prueba del sistema de notificaciones por email.</p>'
        });
        results.email.success = true;
      } catch (error) {
        results.email.error = error.message;
      }
    }
 
    // Probar Slack
    if (this.config.slack.enabled && this.config.slack.webhook) {
      try {
        await this.sendSlackWebhook({
          channel: this.config.slack.channel,
          username: 'Sistema de Respaldo',
          icon_emoji: ':test_tube:',
          text: '🧪 Prueba de notificación del sistema de respaldo'
        });
        results.slack.success = true;
      } catch (error) {
        results.slack.error = error.message;
      }
    }
 
    return results;
  }
}
 
module.exports = NotificationService;
 