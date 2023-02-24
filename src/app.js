// configurations for the entire backend
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");

const session = require("express-session")

require("./db/conn")
const Register = require("./models/registers");
const { json } = require("express");
const { log } = require("console");
const { default: mongoose } = require("mongoose");
const { stringify } = require("querystring");
const { resolveNaptr } = require("dns");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

// session and hbs view engine
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}))
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// routes for the pages
app.get("/", (req, res) => {
    res.render("index")
});

app.post("/wishlist", async (req, res) => {
    try {
        const user = await Register.findOne({ username: req.session.username });

        user.wishlist_name.push(req.body.product_name);
        user.wishlist_desc.push(req.body.product_description);
        user.wishlist_price.push(req.body.product_price);

        await user.save();

        res.status(201).render("index");
    } catch (error) {
        res.status(400).send(error);
    }
})

app.get("/myaccount", async (req, res) => {
    try {
        if (req.session.username) {
            Register.find({ username: req.session.username }, function (err, docs) {
                let i = 0;
                while (docs[i].username != req.session.username) {
                    i++;
                }

                let user = docs[i];
                let wn = user.wishlist_name;
                let wd = user.wishlist_desc;
                let wp = user.wishlist_price;

                let products = [];
                let temp;
                
                for (let j=0; j < wn.length; j++) {
                    temp = {wn:wn[j], wd:wd[j],wp:wp[j]};
                    products.push(temp);
                } 
                

                res.render("myaccount", { users: user, products:products, count:wn.length  })
            })
        } else {
            res.render("login")
        }
    } catch (error) {
        res.status(400).send("invalid")
    }
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/index", (req, res) => {
    res.render("index")
})

app.get("/listing", (req, res) => {
    res.render("listing")
})

app.get("/pass", (req, res) => {
    res.render("pass")
})

app.post("/productpage", async (req, res) => {
    let person_num = req.body.pnum;
    let person_name = req.body.sname;
    let product_num = req.body.indexvalue;
    console.log(product_num);
    console.log(person_num);

    Register.find({ username: person_name }, function (err, docs) {
        let user = docs[person_num];
        console.log(user.product_name);
        let a1 = [];
        let a2 = [];
        let a3 = [];
        let a4 = [];
        let a5 = [];
        let a6=[];
        for (let a=0; a<user.product_name.length;a++) {
            
            if (a!=product_num) {
                a1.push(user.product_desc[a]);
                a2.push(user.product_name[a]);
                a3.push(user.product_price[a]);
                a4.push(user.username);
                a5.push(a);
                a6.push(person_num);
            }
        }

        let product = [];
        let temp;
        for (let i=0; i < a1.length;i++){
            temp = {p_name:a2[i], p_desc:a1[i], p_price:a3[i], snames:a4[i], product_num:a5[i], pnum:a6[i]};
            product.push(temp);
        }
        res.render("productpage", { pnum:person_num, seller: user.username, productname:user.product_name[product_num], productdesc:user.product_desc[product_num], productprice:user.product_price[product_num], products:product })
    })

})

app.get("/buyers", (req, res) => {
    if (req.session.username) {
        Register.find({}, function(err, result) {
            let descs = [];
            let names = [];
            let prices = [];
            let people = [];
            let people_num = [];
            let product_num = [];
        
            for (user in result) {
                for (desc in result[user].product_desc) {
                    descs.push(result[user].product_desc[desc]);
                }
                for (n in result[user].product_name) {
                    names.push(result[user].product_name[n]);
                }
                for (price in result[user].product_price) {
                    prices.push(result[user].product_price[price]);
                    people.push(result[user].username);
                    people_num.push(user);
                    product_num.push(price);
                }
            
            }
            let products = [];
            let temp;
            for (let i=0; i<descs.length; i++) {
                temp = {p_name:names[i], p_desc:descs[i], p_price:prices[i], snames:people[i], pnum:people_num[i], product_num:product_num[i]};
                products.push(temp);
            }
            console.log("buyers");
            res.render("buyers_l", {products:products})
         });


    } else {
        res.render("buyers")
    }
})

app.get("/sellers", async (req, res) => {
    if (req.session.username) {
        try {
            const user = await Register.findOne({ username: req.session.username });

            let count, names;
            if (user.product_name.length) {
                count = user.product_name.length;
                names = user.product_name;
            } else {
                count = 0;
                names = [];
            }

            res.render("sellers_l", { username: req.session.username, count: count, names: names })

        } catch (error) {
            res.status(404).send(error);
        }
    } else {
        res.render("sellers")
    }
})


app.get("/why", (req, res) => {
    res.render("whysite")
})

app.get("/about", (req, res) => {
    res.render("aboutsite")
})

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("login");
})

app.post("/list", async (req, res) => {
    try {
        const user = await Register.findOne({ username: req.session.username });

        user.product_name.push(req.body.product_name);
        user.product_desc.push(req.body.product_description);
        user.product_price.push(req.body.product_price);

        await user.save();

        res.status(201).render("sellers_l", { username: req.session.username, count: user.product_name.length, names: user.product_name });
    } catch (error) {
        res.status(400).send(error);
    }
})

app.post("/register", async (req, res) => {
    try {
        const registerUser = new Register({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            phoneNum: req.body.phoneNum
        })

        await registerUser.save();
        res.status(201).render("login");

    } catch (error) {
        res.status(400).send(error);
    }
})

app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const user = await Register.findOne({ username: username })

        if (user.password === password) {
            req.session.username = username;
            req.session.save();
            res.status(201).render("index");
        } else {
            res.render("login")
        }
    } catch (error) {
        res.status(400).send("invalid login")
    }
})

app.listen(port, () => {
    console.log(`Server is running at port no ${port}`);
});