export default {
    vaildObject: async (required, non_required) => {
        let message = '';
        let empty = [];

        for (let key in required) {
            if (required.hasOwnProperty(key)) {
                if (required[key] == undefined || required[key] == "undefined" || required[key] === '' && (required[key] !== '0' || required[key] !== 0)) {
                    empty.push(key);
                }
            }
        }

        if (empty.length != 0) {
            message = empty.toString();
            if (empty.length > 1) {
                message += " fields are required"
            } else {
                message += " field is required"
            }
            throw {
                'code': 400,
                'message': message
            }
        } else {
            const merge_object = Object.assign(required, non_required);

            for (let data in merge_object) {
                if (merge_object[data] == undefined) {
                    delete merge_object[data];
                } else {
                    if (typeof merge_object[data] == 'string') {
                        merge_object[data] = merge_object[data].trim();
                    }
                }
            }

            return merge_object;
        }
    },

    unauth: function (res, err, body = {}) {
        console.log(err, '===========================>error');
        let code = (typeof err === 'object') ? (err.code) ? err.code : 401 : 401;
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        res.status(code).json({
            'success': false,
            'code': code,
            'message': message,
            'body': body
        });

    },

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