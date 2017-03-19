const ROLE_USER = require('./constants').ROLE_USER;
const ROLE_TEAM = require('./constants').ROLE_TEAM;
const ROLE_ADMIN = require('./constants').ROLE_ADMIN;

const NetworkController = require('./controllers/network');

var fs = require("fs");
var lwip = require('lwip');
var jf = require('jsonfile')
var imagemin = require('image-min');
var path = require('path');
var mkdirp = require('mkdirp');
const moment = require('moment');
// Set user info from request
var sleep = require('sleep');

exports.setUserInfo = function setUserInfo(request) {

    const getUserInfo = {
        _id: request._id,
        profile: {
            firstName: capitalize(request.profile.firstName),
            lastName: capitalize(request.profile.lastName),
            nickName: getNickName(request.profile.firstName, request.profile.lastName),
            gender: request.profile.gender,
            rangeAge: request.profile.rangeAge,
            level: request.profile.level,
            about: request.profile.about,
        },
        provider: request.provider,
        config: request.config,
        media: request.media,

        email: request.email,
        role: request.role,
    };


    return getUserInfo;

};

exports.setUserInfoNetwork = function setUserInfoNetwork(request, is_follow, is_abo) {
    const getUserInfo = {
        _id: request._id,
        firstName: capitalize(request.profile.firstName),
        lastName: capitalize(request.profile.lastName),
        gender: (request.profile.gender),
        nickName: getNickName(request.profile.firstName, request.profile.lastName),
        media: request.media,
        follow: is_follow,
        abos: is_abo,
    };

    return getUserInfo;
};

exports.getRole = function getRole(checkRole) {
    var role;

    switch (checkRole) {
        case ROLE_ADMIN:
            role = 3;
            break;
        case ROLE_TEAM:
            role = 2;
            break;
        case ROLE_USER:
            role = 1;
            break;
        default:
            role = 1;
    }

    return role;
};

exports.writeImgToPath = function writeImgToPath(path_name, file) {
    // read binary data
    //var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    //return new Buffer(bitmap).toString('base64');

    var img = require('request')(
        {
            url: file,
            encoding: 'binary'
        }
        , function (e, r, b) {
            var type = r.headers["content-type"];
            var prefix = "data:" + type + ";base64,";
            var base64 = new Buffer(b, 'binary').toString('base64');
            var dataURI = prefix + base64;
            img = dataURI;

            var imageBuffer = decodeBase64Image(dataURI);
            fs.writeFile(path_name, imageBuffer.data, function (err) {
                console.log(dataURI);
                return path_name;
            });

            return dataURI;
        }
    );

    return img;

};
exports.decodeBase64Images = function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}
exports.getCurrentSeasonTime = function getCurrentSeasonTime() {
    // read binary data
    //var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    //return new Buffer(bitmap).toString('base64');


    var year_day = moment().dayOfYear();
    var year = moment().year();
    var is_leap_year = year % 4 == 0 && year % 100 != 0 || year % 400 == 0
    if (is_leap_year && year_day > 60) {
        // if is leap year and date > 28 february
        year_day = year_day - 1
    }
    var s;
    if (year_day >= 355 || year_day < 81) {
        s = "winter";
    }
    else if (year_day >= 81 || year_day < 173) {
        s = "spring";
    } else if (year_day >= 173 || year_day < 266) {
        s = "summer";
    } else if (year_day >= 266 || year_day < 355) {
        s = "autumn";
    }
    return s;

}
var decodeBase64Image = function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

var getNickName = function getNickName(firstName, lastName) {
    var nickName;

    nickName = capitalize(firstName) + " " + lastName.toUpperCase().substr(0, 1) + "."

    return nickName;
};


var capitalize = function capitalize(s) {
    // returns the first letter capitalized + the string from index 1 and out aka. the rest of the string
    return s[0].toUpperCase() + s.substr(1);
}


var imageRecipeBulder = function imageRecipeBulder(imageBuffer, folder, file_name) {


    lwip.open(imageBuffer.data, 'jpg', function (err, image) {
        if (err) {
            lwip.open(imageBuffer.data, 'png', function (err, image_main) {
                //--- interior
                if (image_main !== null) {
                    image_main.scale((320 / image_main.width()), function (err, image) {
                        image.writeFile(folder + "/" + file_name + "_interior.jpg", function (err) {
                            if (err) return console.log(err);


                            sleep.sleep(1)
                        });
                    });
                }

            });
            //--- very_small
            lwip.open(imageBuffer.data, 'png', function (err, image_main2) {
                //--- interior
                if (image_main2 !== null) {
                    image_main2.resize(80, 80, function (err, image_small) {
                        image_small.writeFile(folder + "/" + file_name + "_very_small.jpg", function (err) {
                            if (err) return console.log(err);


                            sleep.sleep(1)
                        });
                    });
                }
            });
            //--- list_image
            lwip.open(imageBuffer.data, 'png', function (err, image_main3) {
                if (image_main3 !== null) {
                    image_main3.scale((100 / image_main3.width()), function (err, image_list_img) {
                        image_list_img.writeFile(folder + "/" + file_name + "_list_image.jpg", function (err) {
                            if (err) return console.log(err);

                            sleep.sleep(1)
                        });
                    });
                }
            });
            //--- actu
            lwip.open(imageBuffer.data, 'png', function (err, image_main4) {
                if (image_main4 !== null) {
                    image_main4.scale((160 / image_main4.width()), function (err, image_actu) {
                        image_actu.writeFile(folder + "/" + file_name + "_actu.jpg", function (err) {
                            if (err) return console.log(err);

                            sleep.sleep(1)
                        });
                    });
                }
            }); //--- mon cookout
            lwip.open(imageBuffer.data, 'png', function (err, image_main5) {
                if (image_main5 !== null) {
                    image_main5.cover(420, 160, function (err, image_actu) {
                        image_actu.writeFile(folder + "/" + file_name + "_cookout.jpg", function (err) {
                            if (err) return console.log(err);

                            sleep.sleep(1)
                        });
                    });
                }
            });
            //--- slider
            lwip.open(imageBuffer.data, 'png', function (err, image_main6) {
                if (image_main6 !== null) {
                    image_main6.cover(420, 230, function (err, image_actu) {
                        image_actu.writeFile(folder + "/" + file_name + "_slider.jpg", function (err) {
                            if (err) return console.log(err);

                            sleep.sleep(1)
                        });
                    });
                }
            });
            //--- original
            lwip.open(imageBuffer.data, 'png', function (err, image_main7) {
                if (image_main7 !== null) {
                    image_main7.scale(1, function (err, image_actu) {
                        image_actu.writeFile(folder + "/" + file_name + "_original.jpg", function (err) {
                            if (err) return console.log(err);

                            sleep.sleep(1)
                        });
                    });
                }
            });


        } else {
            lwip.open(imageBuffer.data, 'jpg', function (err, image_main) {
                //--- interior
                image_main.scale((320 / image_main.width()), function (err, image) {
                    image.writeFile(folder + "/" + file_name + "_interior.jpg", function (err) {
                        if (err) return console.log(err);


                        sleep.sleep(1)
                    });
                });

            });
            //--- very_small
            lwip.open(imageBuffer.data, 'jpg', function (err, image_main2) {
                //--- interior
                image_main2.resize(80, 80, function (err, image_small) {
                    image_small.writeFile(folder + "/" + file_name + "_very_small.jpg", function (err) {
                        if (err) return console.log(err);


                        sleep.sleep(1)
                    });
                });
            });
            //--- list_image
            lwip.open(imageBuffer.data, 'jpg', function (err, image_main3) {

                image_main3.scale((100 / image_main3.width()), function (err, image_list_img) {
                    image_list_img.writeFile(folder + "/" + file_name + "_list_image.jpg", function (err) {
                        if (err) return console.log(err);

                        sleep.sleep(1)
                    });
                });
            });
            //--- actu
            lwip.open(imageBuffer.data, 'jpg', function (err, image_main4) {

                image_main4.scale((160 / image_main4.width()), function (err, image_actu) {
                    image_actu.writeFile(folder + "/" + file_name + "_actu.jpg", function (err) {
                        if (err) return console.log(err);

                        sleep.sleep(1)
                    });
                });
            }); //--- mon cookout
            lwip.open(imageBuffer.data, 'jpg', function (err, image_main5) {

                image_main5.cover(420, 160, function (err, image_actu) {
                    image_actu.writeFile(folder + "/" + file_name + "_cookout.jpg", function (err) {
                        if (err) return console.log(err);

                        sleep.sleep(1)
                    });
                });
            });
            //--- slider
            lwip.open(imageBuffer.data, 'jpg', function (err, image_main6) {

                image_main6.cover(420, 230, function (err, image_actu) {
                    image_actu.writeFile(folder + "/" + file_name + "_slider.jpg", function (err) {
                        if (err) return console.log(err);

                        sleep.sleep(1)
                    });
                });
            }); //--- original
            lwip.open(imageBuffer.data, 'jpg', function (err, image_main7) {

                image_main7.scale(1, function (err, image_actu) {
                    image_actu.writeFile(folder + "/" + file_name + "_original.jpg", function (err) {
                        if (err) return console.log(err);

                        sleep.sleep(1)
                    });
                });
            });

            return true;

        }
    });

};

exports.imageRecipeBulder = imageRecipeBulder;


var imageCloneBylderBulder = function imageCloneBylderBulder(imageBuffer, folder, file_name) {


        lwip.open(imageBuffer.data, 'jpg', function (err, image) {
            if (err) {
                lwip.open(imageBuffer.data, 'png', function (err, image_main) {
                    image_main.clone(function (err, clone) {
                        image_main.clone(function (err, clone2) {
                            image_main.clone(function (err, clone3) {
                                image_main.clone(function (err, clone4) {
                                    image_main.clone(function (err, clone5) {
                                        image_main.clone(function (err, clone6) {
                                            image_main.clone(function (err, clone7) {
                                                clone.scale((320 / clone.width()), function (err, clone_image) {
                                                    clone_image.writeFile(folder + "/" + file_name + "_interior.jpg", function (err) {
                                                        if (err) return console.log(err);
                                                        clone2.resize(80, 80, function (err, image_small) {
                                                            image_small.writeFile(folder + "/" + file_name + "_very_small.jpg", function (err) {
                                                                if (err) return console.log(err);
                                                                clone3.scale((100 / clone3.width()), function (err, image_list_img) {
                                                                    image_list_img.writeFile(folder + "/" + file_name + "_list_image.jpg", function (err) {
                                                                        if (err) return console.log(err);

                                                                        clone4.scale((160 / clone4.width()), function (err, image_actu) {
                                                                            image_actu.writeFile(folder + "/" + file_name + "_actu.jpg", function (err) {
                                                                                if (err) return console.log(err);

                                                                                clone5.cover(420, 160, function (err, image_co) {
                                                                                    image_co.writeFile(folder + "/" + file_name + "_cookout.jpg", function (err) {
                                                                                        if (err) return console.log(err);

                                                                                        clone6.cover(420, 230, function (err, image_slider) {
                                                                                            image_slider.writeFile(folder + "/" + file_name + "_slider.jpg", function (err) {
                                                                                                if (err) return console.log(err);
                                                                                                clone7.scale(1, function (err, image_ori) {
                                                                                                    image_ori.writeFile(folder + "/" + file_name + "_original.jpg", function (err) {
                                                                                                        if (err) return console.log(err);


                                                                                                    });
                                                                                                });
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });

                                                            });
                                                        })


                                                    });
                                                });
                                            });

                                        });
                                    });
                                });
                            });
                        });


                    });
                });

            } else {


                lwip.open(imageBuffer.data, 'jpg', function (err, image_main) {
                    //--- interior
                    image_main.clone(function (err, clone) {
                        image_main.clone(function (err, clone2) {
                            image_main.clone(function (err, clone3) {
                                image_main.clone(function (err, clone4) {
                                    image_main.clone(function (err, clone5) {
                                        image_main.clone(function (err, clone6) {
                                            image_main.clone(function (err, clone7) {
                                                clone.scale((320 / clone.width()), function (err, clone_image) {
                                                    clone_image.writeFile(folder + "/" + file_name + "_interior.jpg", function (err) {
                                                        if (err) return console.log(err);
                                                        clone2.resize(80, 80, function (err, image_small) {
                                                            image_small.writeFile(folder + "/" + file_name + "_very_small.jpg", function (err) {
                                                                if (err) return console.log(err);
                                                                clone3.scale((100 / clone3.width()), function (err, image_list_img) {
                                                                    image_list_img.writeFile(folder + "/" + file_name + "_list_image.jpg", function (err) {
                                                                        if (err) return console.log(err);

                                                                        clone4.scale((160 / clone4.width()), function (err, image_actu) {
                                                                            image_actu.writeFile(folder + "/" + file_name + "_actu.jpg", function (err) {
                                                                                if (err) return console.log(err);

                                                                                clone5.cover(420, 160, function (err, image_co) {
                                                                                    image_co.writeFile(folder + "/" + file_name + "_cookout.jpg", function (err) {
                                                                                        if (err) return console.log(err);

                                                                                        clone6.cover(420, 230, function (err, image_slider) {
                                                                                            image_slider.writeFile(folder + "/" + file_name + "_slider.jpg", function (err) {
                                                                                                if (err) return console.log(err);
                                                                                                clone7.scale(1, function (err, image_ori) {
                                                                                                    image_ori.writeFile(folder + "/" + file_name + "_original.jpg", function (err) {
                                                                                                        if (err) return console.log(err);


                                                                                                    });
                                                                                                });
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });

                                                            });
                                                        })


                                                    });
                                                });
                                            });

                                        });
                                    });
                                });
                            });
                        });


                    });


                });


                return true;

            }
        })
        ;

    }
    ;

exports.imageCloneBylderBulder = imageCloneBylderBulder;