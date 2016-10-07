var mongoose = require('mongoose'),
	crypto = require('crypto'),

	Schema = mongoose.Schema,

	User = new Schema({
		email: {
			type: String,
			unique: true,
			required: true,
            default: ""
		},
        username: {
			type: String,
			unique: true,
			required: true
		},
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String,
			required: true
		},
        displayName: {
			type: String,
			unique: true,
            default: ""
		},
		styles: {
            type: String,
			required: true
        },
        notification: {
			type: String,
			default: "morning"
		},
        tempUnit: {
            type: String,
            default: "C"
        },
        gender: {
            type: String,
            default: "M"
        },
        isVerified: {
            type: Boolean,
            default: true
        },
        picture: {
            type: String
        },
        fb_id: {
            type: String
        },
        fb_token: {
            type: String
        },
		hashedPassword: {
			type: String,
			required: false
		},
		salt: {
			type: String,
			required: true
		},
		created: {
			type: Date,
			default: Date.now
		},
		//Obsolete
		atWorkStyle: {
            type: String,
			required: true
        },
        onPartyStyle: {
            type: String,
			required: true
        },
        relaxStyle: {
            type: String,
			required: true
        }
	});

User.methods.encryptPassword = function(password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

User.virtual('userId')
.get(function () {
	return this.id;
});

User.virtual('password')
	.set(function(password) {
		this._plainPassword = password;
		this.salt = crypto.randomBytes(32).toString('hex');
		        //more secure - this.salt = crypto.randomBytes(128).toString('hex');
		        this.hashedPassword = this.encryptPassword(password);
		    })
	.get(function() { return this._plainPassword; });


User.methods.checkPassword = function(password) {
	return this.encryptPassword(password) === this.hashedPassword;
};

User.methods.getToSend = function(){
    return {
        email : this.email,
        username: this.username,
        displayName: this.displayName,
        firstName: this.firstName,
        lastName: this.lastName,
        atWorkStyle: this.atWorkStyle,
  		onPartyStyle: this.onPartyStyle,
  		relaxStyle: this.relaxStyle,
        styles: this.styles,
        notification: this.notification,
        tempUnit: this.tempUnit,
        gender: this.gender,
        picture: this.picture,
        isVerified: this.isVerified,
        fb_id: this.fb_id,
        fb_token: this.fb_token
    }
};

module.exports = mongoose.model('User', User);