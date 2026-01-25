
export default {
    success: function (res, message = '', body = {}) {
        return res.status(200).json({
            'success': true,
            'code': 200,
            'message': message,
            'body': body
        });
    },

    error: function (res, err, body = {}) {
        console.log(err, '===========================>error');
        let code = (typeof err === 'object') ? (err.code) ? err.code : 200 : 400;
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        res.status(200).json({
            'success': false,
            'code': code,
            'message': message,
            'body': body
        });
    }
}