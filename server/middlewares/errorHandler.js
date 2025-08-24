// src/middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
            success: false,
            error: 'Database table does not exist'
        });
    }
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        return res.status(500).json({
            success: false,
            error: 'Database access denied'
        });
    }
    
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
};

// Use it in your main app file
import { errorHandler } from './middlewares/errorHandler.js';
app.use(errorHandler);