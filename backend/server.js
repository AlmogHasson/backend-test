const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
let data = require('./data.json');

//GET endpoint to retrieve data from the JSON file
app.get('/data', (req, res) => {
  // Read data from the JSON file
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data file:', err);
      res.status(500).send('Error reading data file');
    } else {
      // Parse JSON data
      const jsonData = JSON.parse(data);
      // Send JSON response
      res.json(jsonData);
    }
  });
});

// Endpoint to edit a domain
app.post('/editDomain', (req, res) => {
  const requestData = req.body;
  let domainToUpdate = null;
  
  // Find the domain to update
  data.forEach(publisher => {
    const foundDomain = publisher.domains.find(domain => domain.domain === requestData.prevDomain);
    if (foundDomain) {
      domainToUpdate = foundDomain;
      return; // Exit the loop if the domain is found
    }
  });

  // Check if domain exists
  if (!domainToUpdate) {
    return res.status(404).json({ error: 'Domain not found' });
  }

  // Update domain's properties with new values
  domainToUpdate.domain = requestData.newDomain;
  domainToUpdate.desktopAds = requestData.desktopAds;
  domainToUpdate.mobileAds = requestData.mobileAds;
  
  // Write the updated data back to the file
  fs.writeFile('./data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error writing to data.json:', err);
      return res.status(500).json({ error: 'Error updating domain' });
    }
    res.json({ message: 'Domain updated successfully', updatedDomain: domainToUpdate });
  });
});


app.get('/domains', (req, res) => {
  // Read the JSON file
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    try {
      // Parse JSON data
      const jsonData = JSON.parse(data);
      const allDomains = [];

      // Iterate over each publisher
      jsonData.forEach(publisher => {
        // Iterate over each domain of the publisher
        publisher.domains.forEach(domain => {
          allDomains.push(domain.domain);
        });
      });
      // Send the list of domains as a response
      res.json(allDomains);
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});


app.post('/addpublisher', (req, res) => {
  const newPublisher = req.body;
  data.push(newPublisher);

  // Save the updated data to the JSON file
  fs.writeFile('./data.json', JSON.stringify(data, null, 2), err => {
    if (err) {
      console.error('Error writing to data.json:', err);
      res.status(500).send('Error writing to data.json');
    } else {
      console.log('New publisher added:', newPublisher);
      res.status(200).json(newPublisher);
    }
  });
});


app.post('/addDomainToPublisher', (req, res) => {
  console.log('addDomainToPublisher')
  const { publisher, newDomain, newDesktopAds, newMobileAds } = req.body;
  // Read the existing data from the JSON file
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data file:', err);
      res.status(500).send('Error reading data file');
      return;
    }

    try {
      // Parse the JSON data
      const jsonData = JSON.parse(data);

      // Find the publisher object in the data
      const selectedPublisherObj = jsonData.find(pub => pub.publisher === publisher);
      console.log(selectedPublisherObj,'selectedPublisherObj')

      if (selectedPublisherObj) {
        // Add the new domain to the publisher's domains array
        selectedPublisherObj.domains.push({
          domain: newDomain,
          desktopAds: newDesktopAds,
          mobileAds: newMobileAds
        });

        // Write the updated data back to the JSON file
        fs.writeFile('./data.json', JSON.stringify(jsonData, null, 2), err => {
          if (err) {
            console.error('Error writing to data.json:', err);
            res.status(500).send('Error writing to data.json');
          } else {
            console.log('Domain added to publisher:', publisher);
            res.status(200).json(selectedPublisherObj);
          }
        });
      } else {
        res.status(404).send('Publisher not found');
      }
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      res.status(500).send('Error parsing JSON data');
    }
  });
});



  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });