const User = require('../models/userModel');

// REGISTER
exports.register = async function(req, res) {
            console.log(req.body)
    try {
        const user = new User({
            email: req.body.email,
            password: req.body.password,
            gender: req.body.gender,
            dateOfBirth: new Date(req.body.dateOfBirth)
        });

        await user.save();

       return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Registration failed",
            error: err.message
        });
    }
};

exports.login = async function(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(401).json({
            message: "User with this email not found"
            });
        }

        const match = await user.comparePassword(req.body.password);

        if (!match) {
            return res.status(401).json({
            message: "Wrong password"
            });
        }

        req.session.userId = user._id; //almost like signing the session to be yours (session id auto generated gets stored to a cookie)
        console.log(req.session.userId)
        //cookie is sent after session is cretaed browser needs to accept it

        return res.status(201).json({
            success: true,
            message: "User login successfull",
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (err) {
        return res.status(500).json({
            success: true,
            message: "Login Failed"
        });
    }
};

exports.logout = function(req, res) {
    try {
        req.session.destroy();

        return res.status(201).json({
            success: true,
            message: "User logout successfull"
        });

    } catch (err) {
        return res.status(500).json({
            success: true,
            message: "logout Failed"
        });
    }   
};

exports.saveForm = async function(req, res) {
    console.log(req.session.userId)
   try {
       const user = await User.findOne({ _id: req.session.userId }); //cookie sends session id that has userid stored so the backend can find the wanted session

       if (!user) {
            return res.status(401).json({
            message: "User with your ID not found"
            });
        }

        user.username = req.body.username;
        user.education = req.body.education;
        user.employment = req.body.employment;

        await user.save();

        return res.status(201).json({
            success: true,
            message: "User form sucesfully saved",
            user: {
                username: user.username,
                education: user.education
            }
        });


    } catch (err) {
        return res.status(500).json({
            success: true,
            message: "Form saving failed"
        });
    }
};