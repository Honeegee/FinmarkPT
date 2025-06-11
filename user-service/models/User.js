const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.password_hash = userData.password_hash;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.role = userData.role;
    this.is_active = userData.is_active;
    this.email_verified = userData.email_verified;
    this.phone = userData.phone;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM user_schema.users WHERE email = $1',
        [email]
      );
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM user_schema.users WHERE id = $1',
        [id]
      );
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { email, password, firstName, lastName, role = 'customer' } = userData;
      
      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const result = await query(
        `INSERT INTO user_schema.users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [email, password_hash, firstName, lastName, role]
      );

      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async validatePassword(password) {
    try {
      return await bcrypt.compare(password, this.password_hash);
    } catch (error) {
      console.error('Error validating password:', error);
      throw error;
    }
  }

  async update(updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id') {
          fields.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        return this;
      }

      values.push(this.id);
      const result = await query(
        `UPDATE user_schema.users 
         SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async saveRefreshToken(userId, refreshToken, expiresAt, ipAddress, userAgent) {
    try {
      await query(
        `INSERT INTO user_schema.user_sessions (user_id, refresh_token, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, refreshToken, expiresAt, ipAddress, userAgent]
      );
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  static async findByRefreshToken(refreshToken) {
    try {
      const result = await query(
        `SELECT u.*, s.refresh_token, s.expires_at
         FROM user_schema.users u
         JOIN user_schema.user_sessions s ON u.id = s.user_id
         WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
        [refreshToken]
      );
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      console.error('Error finding user by refresh token:', error);
      throw error;
    }
  }

  static async deleteRefreshToken(refreshToken) {
    try {
      await query(
        'DELETE FROM user_schema.user_sessions WHERE refresh_token = $1',
        [refreshToken]
      );
    } catch (error) {
      console.error('Error deleting refresh token:', error);
      throw error;
    }
  }

  toJSON() {
    const { password_hash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
