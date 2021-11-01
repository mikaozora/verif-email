module.exports = {
    ENV: process.env.ENV || 'development',
    PORT: process.env.PORT || 3000,
    URL: process.env.URL || 'http://localhost:3000',
    MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/customer-api',
    JWT_SECREET: process.env.SECRETKEY || 'mika123',
    ACCOUNT_SID: process.env.ACCOUNT_SID || 'ini twillio',
    AUTH_TOKEN: process.env.AUTH_TOKEN || '83adf44c522f420707ce7cbf4242b8c6',
    SMS_KEY: process.env.SMS_KEY || '390c9a51c3493c194e7e2c5215c4dd69d7e9da259622c2a97ffd9f921949ee68fe6b5a52fdef0a84c4d556fff5238ff6bda37e9788adec5b6fe31f8b29ffada8',
    REDIS_PORT: process.env.REDIS_PORT || 6379
}