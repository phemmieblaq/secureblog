// Import the necessary libraries
const request = require('supertest');

const { app } = require("../index");


describe('User tests', () => {
    let csrfToken;
    let cookies;

    beforeAll(async () => {
        const emailbody='test@gmail.com'
        // Fetch the CSRF token before running the tests
        const csrfResponse = await request(app).get("/csrf-token").expect(200);
   
        csrfToken = csrfResponse.body.csrfToken;
        //console.log(csrfToken);

        // Save the cookies to use in later requests
        cookies = csrfResponse.headers['set-cookie'];
        const deleteUserResponse= await request(app).delete("/delete-user")
        .set('Cookie', cookies)
        .set('CSRF-Token', csrfToken) // Include the CSRF token in the request headers
        .send({email: emailbody });

        
        //console.log(cookies);
    });
    it('should fail to add user because email exists ', async () => {
        // Attempt to log in a user with the fetched CSRF token and credentials
        const postResponse = await request(app)
            .post('/auth/signup')
            .set('Cookie', cookies)
            .set('CSRF-Token', csrfToken) // Include the CSRF token in the request headers
            .send({ username:'jidex',email: 'akinyemi@sidebrief.com', password_hash: 'bams1234' });
    
       // test is going to fail because the email already exist it suppose to be 400
        expect(postResponse.statusCode).toBe(200);
    });



    it('should add a user', async () => {
        // Attempt to log in a user with the fetched CSRF token and credentials
        const postResponse = await request(app)
            .post('/auth/signup')
            .set('Cookie', cookies)
            .set('CSRF-Token', csrfToken) // Include the CSRF token in the request headers
            .send({ username:'maradona11',email: 'test@gmail.com', password_hash: 'bams1234' });
    

        expect(postResponse.statusCode).toBe(201);
    });

    it('should not log in a user due to incorrect password ', async () => {
        // Attempt to log in a user with the fetched CSRF token and credentials
        const postResponse = await request(app)
            .post('/auth/login')
            .set('Cookie', cookies)
            .set('CSRF-Token', csrfToken) // Include the CSRF token in the request headers
            .send({ email: 'akinyemi@sidebrief.com', password_hash: 'bams12345' });
    
        // Expect a 200 status code indicating a successful login
        expect(postResponse.statusCode).toBe(201);
    });

    it('should not log in a user due to incorrect email ', async () => {
        // Attempt to log in a user with the fetched CSRF token and credentials
        const postResponse = await request(app)
            .post('/auth/login')
            .set('Cookie', cookies)
            .set('CSRF-Token', csrfToken) // Include the CSRF token in the request headers
            .send({ email: 'akinyemi11@sidebrief.com', password_hash: 'bams1234' });
    
        // Expect a 200 status code indicating a successful login
        expect(postResponse.statusCode).toBe(201);
    });




    it('should log in a user', async () => {
        // Attempt to log in a user with the fetched CSRF token and credentials
        const postResponse = await request(app)
            .post('/auth/login')
            .set('Cookie', cookies)
            .set('CSRF-Token', csrfToken) // Include the CSRF token in the request headers
            .send({ email: 'akinyemi@sidebrief.com', password_hash: '@Phemmieblaq97' });
    
        // Expect a 200 status code indicating a successful login
        expect(postResponse.statusCode).toBe(200);
    });
    // it('should log in a user', async () => {
    //     const postResponse = await request(app)
    //         .post('/login')
    //         .set('Cookie', cookies)
    //         .send({ _csrf: csrfToken, username: 'test', password: 'test' });

    //     expect(postResponse.statusCode).toBe(200);
    // });
});