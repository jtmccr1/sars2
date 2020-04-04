# Visualization of Sars-Cov2 phylogengy

This is an experiment in displaying uncertain topologies. It is being developed concurrently with my other repository figtreejs-react.

## Development setup

Currently most development is happening in figtreejs-react, so set up is a little more involved
then the usual clone and install.

```
git clone https://github.com/jtmccr1/sars2.git
cd sars2
yarn install
```

Clone and install [figtreejs-react](https://github.com/jtmccr1/figtreejs-react).

We then have to link to figtreejs-react. In the figtreejs-react directory

```
yarn link
```
in the sars 2 directory
```
yarn link "figtreejs-react"
```

To avoid an invalid hooks error we have to tell figtreejs-react to use 
the react in sars2. So back in that directory 

```
npm link PATH/TO/SARS2/node_modules/react
```

finally

```
yarn start
```


Analysis was done by Verity Hill, Sam Hong, Guy Baele, and Phillipe Lemey.

Genetic data was obtained from  http://gisaid.org  and table of acknowledgments is in the public directory.