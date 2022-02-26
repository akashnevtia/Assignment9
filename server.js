const express = require('express')
const app = express()
const port = 3000
const axios = require('axios')
const mariadb = require('mariadb');

const bodyParser = require('body-parser');
const { query } = require('express');
const { urlencoded } = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

//new quiz code

app.get('/',(req, res)=>{
    res.send("AWS lambda function available to test. http://161.35.14.40:3000/say?keyword=HelloWorld")
})

app.get('/say', (req,res) => {
    axios.get(`https://bgevcf9ikg.execute-api.us-east-2.amazonaws.com/prod/say?keyword=`+req.query.keyword)
    .then(result => {
        res.status(200)
        res.send(result.data)
    })
    .catch(err => {
        res.status(400)
        res.send(err)
    })
})

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const {check, body, validationResult } = require('express-validator');

const options = {
    swaggerDefinition: {
      info: {
        title: "Quiz 8",
        version: "1.0",
        description: "UI for Quiz8",
      },
      host: "localhost:3000",
      basePath: "/",
    },
    apis: ["./server.js"],
  };

const specs = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());



const pool = mariadb.createPool({
     host: 'localhost', 
     user:'root', 
     password: 'root',
     database:'sample',
     port:3306,
     connectionLimit: 5
});

/**
 * @swagger
 * /customers:
 *    get:
 *      description: Return all records from customers table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Obejct containg arrays of customers
 */
app.get('/customers', async(req, res) => {
    
    res.setHeader('Content-Type','application/json')

    let conn;
    try {
      conn = await pool.getConnection();
      console.log('connect')
      const cust = await conn.query("SELECT * from customer"); 
     
      res.json(cust);
      
     
    } catch (err) {
         
      throw err;
    } finally {
      if (conn) return conn.end();
    }
})

/**
 * @swagger
 * /company:
 *    get:
 *      description: Return all records from company table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Obejct containg arrays of company
 */
app.get('/company', async(req, res) => {
    
  res.setHeader('Content-Type','application/json')
  
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('connect')
    const comp = await conn.query("SELECT * from company"); 
   
    res.json(comp);
    
   
  } catch (err) {
       
    throw err;
  } finally {
    if (conn) return conn.end();
  }
})

/**
 * @swagger
 * /foods:
 *    get:
 *      description: Return all records from foods table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Obejct containg arrays of foods
 */
app.get('/foods', async(req, res) => {
    
  res.setHeader('Content-Type','application/json')
  
  let conn;
  try {
    conn = await pool.getConnection();
   
    const foods = await conn.query("SELECT * from foods"); 
   
    res.json(foods);
    
   
  } catch (err) {
       
    throw err;
  } finally {
    if (conn) return conn.end();
  }
})

/**
 * @swagger
 * definitions:
 *   Foods:
 *     properties:
 *       itemid:
 *         type: string
 *       itemname:
 *         type: string
 *       itemunit:
 *         type: string
 *       companyid:
 *         type: string
 */
/**
 * @swagger
 * /foods/post:
 *    post:
 *      description: add record to Foods table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Successfully added data to Foods table
 *          500:
 *              description: Data already exists
 *      parameters:
 *          - name: Foods
 *            description: company object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Foods'
 *
 *
 */
app.post("/foods/post",urlencodedParser,[

    check('itemid').isNumeric()
    .withMessage('id should only have Number').isLength({max:6}).withMessage("Id should have maximum 6 numbers"),
    check('itemname').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
    .withMessage('Name should only have Alphabets').isLength({max:25}).withMessage("Name should have maximum 25 characters"),
    check('itemunit').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
    .withMessage('Unit should only have Alphabets').isLength({max:5}).withMessage("Name should have maximum 5 characters")

],async(req, res) => {

    var errors= validationResult(req);
    
    if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
          
    }else{ 
    if(req.body==null || req.body.itemname==null || req.body.itemunit==null
      || req.body.companyid==null){
       res.header("Content-Type", "application/json");
       res.status(400);
       res.send("Invalid Body");
       return;
      }
    pool
      .getConnection()
      .then((conn) => {
        conn.query("SELECT * FROM foods where ITEM_ID=?",[req.body.itemid]).then((row)=>{
          if(row.length>0){
            res.header("Content-Type", "application/json");
            res.status(500).send({error:"Data already exists"});
            conn.close();
            return;
          }
          conn.query("INSERT INTO foods VALUE (?,?,?,?)",
            [req.body.itemid,req.body.itemname, req.body.itemunit,req.body.companyid])
              .then((data) => {
                res.header("Content-Type", "application/json");
                res.status(200);
                res.send(data);
                conn.close();
              })
        })
      }).catch((err) => {
        console.log(err);
        conn.close();
      });
    }
  });


  /**
 * @swagger
 * /foods/put:
 *    put:
 *      description: Add to Foods table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Successfully added data to Foods table
 *          500:
 *              description: Data already exists
 *      parameters:
 *          - name: Foods
 *            description: food object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Foods'
 *
 *
 */
  app.put("/foods/put",[

    check('itemid').isNumeric()
    .withMessage('id should only have Number').isLength({max:6}).withMessage("Id should have maximum 6 numbers"),
    check('itemname').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
    .withMessage('Name should only have Alphabets').isLength({max:25}).withMessage("Name should have maximum 25 characters"),
    check('itemunit').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
    .withMessage('Unit should only have Alphabets').isLength({max:5}).withMessage("Name should have maximum 5 characters")

] ,(req, res) => {
    var errors= validationResult(req);
    
    if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
          
    }else{

    console.log(req.body);
    pool
      .getConnection()
      .then((conn) => {
        conn.query("SELECT * FROM foods where ITEM_ID=?",[req.body.itemid]).then((row)=>{
          if(row.length==0){
            res.header("Content-Type", "application/json");
            conn.query("INSERT INTO foods VALUE (?,?,?,?)",
            [req.body.itemid,req.body.itemname, req.body.itemunit,req.body.companyid])
              .then((data) => {
                res.header("Content-Type", "application/json");
                res.status(200);
                res.send(data);
                conn.close();
              })
             
            return;
          }
          conn.query("UPDATE foods SET ITEM_NAME=?, ITEM_UNIT=?, COMPANY_ID=? WHERE ITEM_ID=?",
            [req.body.itemname, req.body.itemunit, req.body.companyid,req.body.itemid])
              .then((data) => {
                res.header("Content-Type", "application/json");
                res.status(200);
                res.send(data);
                conn.close();
              })
              .catch((err) => {
                console.log(err);
                conn.end();
              });
  
        })
      .catch((err) => {
        console.log(err);
        conn.end();
      });
    });
}
  });


  /**
 * @swagger
 * /foods/patch:
 *    patch:
 *      description: patch record to Foods table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Patched data to Foods table
 *      parameters:
 *          - name: Foods
 *            description:  object
 *            in: body
 *            required: true
 *            schema:
 *              $ref: '#/definitions/Foods'
 *
 *
 */
  app.patch('/foods/patch',[
    check('itemid').isNumeric()
    .withMessage('id should only have Number').isLength({max:6}).withMessage("Id should have maximum 6 numbers"),
    check('itemname').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
    .withMessage('Name should only have Alphabets').isLength({max:25}).withMessage("Name should have maximum 25 characters"),
    check('itemunit').trim().escape().custom(value => /^([a-zA-Z\s])*$/.test(value))
    .withMessage('Unit should only have Alphabets').isLength({max:5}).withMessage("Name should have maximum 5 characters")

  ] ,(req, res)=>{
    var errors= validationResult(req);
    
    if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
          
    }else{

    pool.getConnection()
    .then(con =>{
            
             con.query("SELECT * FROM foods where ITEM_ID=?",[req.body.itemid]).then((data)=>{
               console.log(data[0]);
               const arr=data[0];

               if(req.body.itemname!=null){
                   arr.ITEM_NAME=req.body.itemname
                }
                 if(req.body.itemunit!=null){
                arr.ITEM_UNIT=req.body.itemunit
                }
               if(req.body.companyid!=null){
                arr.COMPANY_ID=req.body.companyid
                }
               
                if (data.length == 0){
                  res.status(500).send({error:"No Such food Exists"});
                  con.close();
                  return;
                }
                con.query("UPDATE foods SET ITEM_NAME=?, ITEM_UNIT=?,COMPANY_ID=?  WHERE ITEM_ID=?",
                [arr.ITEM_NAME, arr.ITEM_UNIT, arr.COMPANY_ID,arr.ITEM_ID])
                  .then(()=>{
                   
                  res.send("update company name  successfully");
                  con.end();
                })
              
           })
           .catch(err =>{
                
                console.log(err);
                
                con.end();
            });
    }).catch(err=>{
            console.log(err);
    });
}
});


/**
 * @swagger
 * /foods/delete/{item_id}:
 *    delete:
 *      description: delete from Foods table
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: deleted data from Foods table
 *          500:
 *              description: Data not found
 *      parameters:
 *          - name: item_id
 *            description:  enter item id
 *            in: path
 *            required: true
 *            type : number
 *
 *
 */
  app.delete('/foods/delete/:item_id',[
    
  ],(req, res)=>{
    var errors= validationResult(req);
    
    if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
          
    }else{
      console.log(req.params)
      if(req.params==null ){
        res.header("Content-Type", "application/json");
        res.status(400);
        res.send("Please put a valid id to delete");
      }
    pool.getConnection()
    .then(con =>{

        con.query("SELECT * FROM foods where ITEM_ID=?",[req.params.item_id]).then((row)=>{
            if(row.length==0){
              res.header("Content-Type", "application/json");
              res.status(500).send({error:"Data dosent exists"});
              con.close();
              return;
            }
            con.query("DELETE from foods WHERE ITEM_ID='"+[req.params.item_id]+"'")
            .then(()=>{
                
                res.send("delete successfully");
                con.end();
            })
        })
           .catch(err =>{
                console.log(err);
                con.end();
            });
    }).catch(err=>{
            console.log(err);
    });
}
});

app.listen(port, () => {

  console.log(`Example app listening at http://http://161.35.14.40:${port}`)
})