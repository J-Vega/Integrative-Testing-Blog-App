'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

//makes 'expect' syntax available
const expect = chai.expect;

const {Blogpost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

const blogContent = "This is generic content to put into each post";

function seedBlogpostData(){
	console.info('seeding blogpost data');
	const seedData = [];

	for(let i=1; i<5; i++){
		seedData.push(generateBlogpostData());
	}

	return Blogpost.insertMany(seedData);
}

function generateBlogpostData(){
	return {
		author: `${faker.name.firstName()} ${faker.name.lastName()}`;
		title: `This is the title - `
		content: faker.Lorem.paragraph();
	}
}

function tearDownDb(){
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

describe('Blogpost API Resource', function(){

	before(function(){
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function(){
		return seedBlogpostData();
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function(){
		return closeServer();
	});


	describe('GET endpoint', function(){

		it('should return all existing blogposts', function(){

			let res;
			return chai.request(app)
			.get('/blogposts')
			.then(function(_res){
				res = _res;
				expect(res).to.have.status(200);
				//If status is not 200, the db seeding did not work
				

				expect(res.body.blogposts).to.have.lengthOf.at.least(1);
				return Blogpost.count();
			});
			.then(function(count){
				expect(res.body.blogposts).to.have.lengthOf(count);
			});
		});

	});

});
