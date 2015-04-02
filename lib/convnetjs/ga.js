
/*    

GA addon for convnet.js

@licstart  The following is the entire license notice for the 
JavaScript code in this page.

Copyright (C) 2015 david ha, otoro.net, otoro labs

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.   


@licend  The above is the entire license notice
for the JavaScript code in this page.
*/

(function(global) {
  "use strict";
  var Vol = convnetjs.Vol; // convenience

  // used utilities, make explicit local references
  var randf = convnetjs.randf;
  var randn = convnetjs.randn;
  var randi = convnetjs.randi;
  var zeros = convnetjs.zeros;
  var Net = convnetjs.Net;
  var maxmin = convnetjs.maxmin;
  var randperm = convnetjs.randperm;
  var weightedSample = convnetjs.weightedSample;
  var getopt = convnetjs.getopt;
  var arrUnique = convnetjs.arrUnique;

  function assert(condition, message) {
      if (!condition) {
          message = message || "Assertion failed";
          if (typeof Error !== "undefined") {
              throw new Error(message);
          }
          throw message; // Fallback
      }
  }

  // returns a random cauchy random variable with gamma (controls magnitude sort of like stdev in randn)
  // http://en.wikipedia.org/wiki/Cauchy_distribution
  var randc = function(m, gamma) {
    return m + gamma * 0.01 * randn(0.0, 1.0) / randn(0.0, 1.0);
  };

  // chromosome implementation using an array of floats
  var Chromosome = function(floatArray) {
    this.fitness = 0; // default value
    this.nTrial = 0; // number of trials subjected to so far.
    this.gene = floatArray;
  };

  Chromosome.prototype = {
    burst_mutate: function(burst_magnitude_) { // adds a normal random variable of stdev width, zero mean to each gene.
      var burst_magnitude = burst_magnitude_ || 0.1;
      var i, N;
      N = this.gene.length;
      for (i = 0; i < N; i++) {
        this.gene[i] += randn(0.0, burst_magnitude);
      }
    },
    randomize: function(burst_magnitude_) { // resets each gene to a random value with zero mean and stdev
      var burst_magnitude = burst_magnitude_ || 0.1;
      var i, N;
      N = this.gene.length;
      for (i = 0; i < N; i++) {
        this.gene[i] = randn(0.0, burst_magnitude);
      }
    },
    mutate: function(mutation_rate_, burst_magnitude_) { // adds random gaussian (0,stdev) to each gene with prob mutation_rate
      var mutation_rate = mutation_rate_ || 0.1;
      var burst_magnitude = burst_magnitude_ || 0.1;
      var i, N;
      N = this.gene.length;
      for (i = 0; i < N; i++) {
        if (randf(0,1) < mutation_rate) {
          this.gene[i] += randn(0.0, burst_magnitude);
        }
      }
    },
    crossover: function(partner, kid1, kid2) { // performs one-point crossover with partner to produce 2 kids
    //assumes all chromosomes are initialised with same array size. pls make sure of this before calling
      var i, N;
      N = this.gene.length;
      var l = randi(0, N); // crossover point
      for (i = 0; i < N; i++) {
        if (i < l) {
          kid1.gene[i] = this.gene[i];
          kid2.gene[i] = partner.gene[i];
        } else {
          kid1.gene[i] = partner.gene[i];
          kid2.gene[i] = this.gene[i];
        }
      }
    },
    copyFrom: function(c) { // copies c's gene into itself
      var i, N;
      this.copyFromGene(c.gene);
    },
    copyFromGene: function(gene) { // gene into itself
      var i, N;
      N = this.gene.length;
      for (i = 0; i < N; i++) {
        this.gene[i] = gene[i];
      }
    },
    clone: function() { // returns an exact copy of itself (into new memory, doesn't return reference)
      var newGene = zeros(this.gene.length);
      var i;
      for (i = 0; i < this.gene.length; i++) {
        newGene[i] = Math.round(10000*this.gene[i])/10000;
      }
      var c = new Chromosome(newGene);
      c.fitness = this.fitness;
      return c;
    },
    pushToNetwork: function(net) { // pushes this chromosome to a specified network
      pushGeneToNetwork(net, this.gene);
    }
  };

  // counts the number of weights and biases in the network
  function getNetworkSize(net) {
    var layer = null;
    var filter = null;
    var bias = null;
    var w = null;
    var count = 0;
    var i, j, k;
    for ( i = 0; i < net.layers.length; i++) {
      layer = net.layers[i];
      filter = layer.filters;
      if (filter) {
        for ( j = 0; j < filter.length; j++) {
          w = filter[j].w;
          count += w.length;
        }
      }
      bias = layer.biases;
      if (bias) {
        w = bias.w;
        count += w.length;
      }
    }
    return count;
  }

  function pushGeneToNetwork(net, gene) { // pushes the gene (floatArray) to fill up weights and biases in net
    var count = 0;
    var layer = null;
    var filter = null;
    var bias = null;
    var w = null;
    var i, j, k;
    for ( i = 0; i < net.layers.length; i++) {
      layer = net.layers[i];
      filter = layer.filters;
      if (filter) {
        for ( j = 0; j < filter.length; j++) {
          w = filter[j].w;
          for ( k = 0; k < w.length; k++) {
            w[k] = gene[count++];
          }
        }
      }
      bias = layer.biases;
      if (bias) {
        w = bias.w;
        for ( k = 0; k < w.length; k++) {
          w[k] = gene[count++];
        }  
      }
    }
  }

  function getGeneFromNetwork(net) { // gets all the weight/biases from network in a floatArray
    var gene = [];
    var layer = null;
    var filter = null;
    var bias = null;
    var w = null;
    var i, j, k;
    for ( i = 0; i < net.layers.length; i++) {
      layer = net.layers[i];
      filter = layer.filters;
      if (filter) {
        for ( j = 0; j < filter.length; j++) {
          w = filter[j].w;
          for ( k = 0; k < w.length; k++) {
            gene.push(w[k]);
          }
        }
      }
      bias = layer.biases;
      if (bias) {
        w = bias.w;
        for ( k = 0; k < w.length; k++) {
          gene.push(w[k]);
        }  
      }
    }
    return gene;
  }

  function copyFloatArray(x) { // returns a FloatArray copy of real numbered array x.
    var N = x.length;
    var y = zeros(N);
    for (var i = 0; i < N; i++) {
      y[i] = x[i];
    }
    return y;
  }

  function copyFloatArrayIntoArray(x, y) { // copies a FloatArray copy of real numbered array x into y
    var N = x.length;
    for (var i = 0; i < N; i++) {
      y[i] = x[i];
    }
  }

  // randomize neural network with random weights and biases
  var randomizeNetwork = function(net) {
    var netSize = getNetworkSize(net);
    var chromosome = new Chromosome(zeros(netSize));
    chromosome.randomize(1.0);
    pushGeneToNetwork(net, chromosome.gene);
  };

  // implementation of basic conventional neuroevolution algorithm (CNE)
  //
  // options:
  // population_size : positive integer
  // mutation_rate : [0, 1], when mutation happens, chance of each gene getting mutated
  // elite_percentage : [0, 0.3], only this group mates and produces offsprings
  // mutation_size : positive floating point.  stdev of gausian noise added for mutations
  // target_fitness : after fitness achieved is greater than this float value, learning stops
  // burst_generations : positive integer.  if best fitness doesn't improve after this number of generations
  //                    then mutate everything!
  // best_trial : default 1.  save best of best_trial's results for each chromosome.
  // num_match : for use in arms race mode.  how many random matches we set for each chromosome when it is its turn.
  //
  // initGene:  init float array to initialize the chromosomes.  can be result obtained from pretrained sessions.
  var GATrainer = function(net, options_, initGene) {

    this.net = net;

    var options = options_ || {};
    this.population_size = typeof options.population_size !== 'undefined' ? options.population_size : 100;
    this.population_size = Math.floor(this.population_size/2)*2; // make sure even number
    this.mutation_rate = typeof options.mutation_rate !== 'undefined' ? options.mutation_rate : 0.01;
    this.elite_percentage = typeof options.elite_percentage !== 'undefined' ? options.elite_percentage : 0.2;
    this.mutation_size = typeof options.mutation_size !== 'undefined' ? options.mutation_size : 0.05;
    this.target_fitness = typeof options.target_fitness !== 'undefined' ? options.target_fitness : 10000000000000000;
    this.burst_generations = typeof options.burst_generations !== 'undefined' ? options.burst_generations : 10;
    this.best_trial = typeof options.best_trial !== 'undefined' ? options.best_trial : 1;
    this.num_match = typeof options.num_match !== 'undefined' ? options.num_match : 1;
    this.chromosome_size = getNetworkSize(this.net);

    var initChromosome = null;
    if (initGene) {
      initChromosome = new Chromosome(initGene);
    }

    this.chromosomes = []; // population
    for (var i = 0; i < this.population_size; i++) {
      var chromosome = new Chromosome(zeros(this.chromosome_size));
      if (initChromosome) { // if initial gene supplied, burst mutate param.
        chromosome.copyFrom(initChromosome);
        // pushGeneToNetwork(this.net, initChromosome.gene); // this line may be redundant. (*1)
        if (i > 0) { // don't mutate the first guy.
          chromosome.burst_mutate(this.mutation_size);
        }
      } else {
        chromosome.randomize(1.0);
      }
      this.chromosomes.push(chromosome);
    }
    pushGeneToNetwork(this.net, this.chromosomes[0].gene); // push first chromosome to neural network. (replaced *1 above)

    this.bestFitness = -10000000000000000;
    this.bestFitnessCount = 0;

  };

  GATrainer.prototype = {
    train: function(fitFunc) { // has to pass in fitness function.  returns best fitness
      var bestFitFunc = function(nTrial, net) {
        var bestFitness = -10000000000000000;
        var fitness;
        for (var i = 0; i < nTrial; i++) {
          fitness = fitFunc(net);
          if (fitness > bestFitness) {
            bestFitness = fitness;
          }
        }
        return bestFitness;
      };

      var i, N;
      var fitness;
      var c = this.chromosomes;
      N = this.population_size;

      var bestFitness = -10000000000000000;

      // process first net (the best one)
      pushGeneToNetwork(this.net, c[0].gene);
      fitness = bestFitFunc(this.best_trial, this.net);
      c[0].fitness = fitness;
      bestFitness = fitness;
      if (bestFitness > this.target_fitness) {
        return bestFitness;
      }

      for (i = 1; i < N; i++) {
        pushGeneToNetwork(this.net, c[i].gene);
        fitness = bestFitFunc(this.best_trial, this.net);
        c[i].fitness = fitness;
        if (fitness > bestFitness) {
          bestFitness = fitness;
        }
      }

      // sort the chromosomes by fitness
      c = c.sort(function (a, b) {
        if (a.fitness > b.fitness) { return -1; }
        if (a.fitness < b.fitness) { return 1; }
        return 0;
      });

      var Nelite = Math.floor(Math.floor(this.elite_percentage*N)/2)*2; // even number
      for (i = Nelite; i < N; i+=2) {
        var p1 = randi(0, Nelite);
        var p2 = randi(0, Nelite);
        c[p1].crossover(c[p2], c[i], c[i+1]);
      }

      for (i = 1; i < N; i++) { // keep best guy the same.  don't mutate the best one, so start from 1, not 0.
        c[i].mutate(this.mutation_rate, this.mutation_size);
      }

      // push best one to network.
      pushGeneToNetwork(this.net, c[0].gene);
      if (bestFitness < this.bestFitness) { // didn't beat the record this time
        this.bestFitnessCount++;
        if (this.bestFitnessCount > this.burst_generations) { // stagnation, do burst mutate!
          for (i = 1; i < N; i++) { 
            c[i].copyFrom(c[0]);
            c[i].burst_mutate(this.mutation_size);
          }
          //c[0].burst_mutate(this.mutation_size); // don't mutate best solution.
        }

      } else {
        this.bestFitnessCount = 0; // reset count for burst
        this.bestFitness = bestFitness; // record the best fitness score
      }

      return bestFitness;
    },
    matchTrain: function(matchFunc) { // uses arms race to determine best chromosome by playing them against each other
      // this algorithm loops through each chromosome, and for each chromosome, it will play num_match games
      // against other chromosomes.  at the same time.  if it wins, the fitness is incremented by 1
      // else it is subtracted by 1.  if the game is tied, the fitness doesn't change.
      // at the end of the algorithm, each fitness is divided by the number of games the chromosome has played
      // the algorithm will then sort the chromosomes by this average fitness

      var i, j, N;
      var opponent;
      var fitness;
      var c = this.chromosomes;
      var result = 0;
      N = this.population_size;

      // zero out all fitness and 
      for (i = 0; i < N; i++) {
        c[i].fitness = 0;
        c[i].nTrial = 0;
      }

      // get these guys to fight against each other!
      for (i = 0; i < N; i++) {
        
        for (j = 0; j < this.num_match; j++) {
          opponent = randi(0, N);
          if (opponent === i) continue;
          result = matchFunc(c[i], c[opponent]);
          c[i].nTrial += 1;
          c[opponent].nTrial += 1;
          c[i].fitness += (result+1);
          c[opponent].fitness += ((-result)+1); // if result is -1, it means opponent has won.
        }
      }

      // average out all fitness scores by the number of matches each chromosome has done.
      
      for (i = 0; i < N; i++) {
        if (c[i].nTrial > 0) {
          c[i].fitness /= c[i].nTrial;
        }
      }
      

      // sort the chromosomes by fitness
      c = c.sort(function (a, b) {
        if (a.fitness > b.fitness) { return -1; }
        if (a.fitness < b.fitness) { return 1; }
        return 0;
      });

      var Nelite = Math.floor(Math.floor(this.elite_percentage*N)/2)*2; // even number
      for (i = Nelite; i < N; i+=2) {
        var p1 = randi(0, Nelite);
        var p2 = randi(0, Nelite);
        c[p1].crossover(c[p2], c[i], c[i+1]);
      }

      for (i = 2; i < N; i++) { // keep two best guys the same.  don't mutate the best one, so start from 2, not 0.
        c[i].mutate(this.mutation_rate, this.mutation_size);
      }

      // push best one to network.
      pushGeneToNetwork(this.net, c[0].gene);

      // return; // this funciton doesn't return anything.
      // debug info, print out all fitness

    }
  };

  // variant of ESP network implemented
  // population of N sub neural nets, each to be co-evolved by ESPTrainer
  // fully recurrent.  outputs of each sub nn is also the input of all other sub nn's and itself.
  // inputs should be order of ~ -10 to +10, and expect output to be similar magnitude.
  // user can grab outputs of the the N sub networks and use them to accomplish some task for training
  //
  // Nsp: Number of sub populations (ie, 4)
  // Ninput: Number of real inputs to the system (ie, 2).  so actual number of input is Niput + Nsp
  // Nhidden:  Number of hidden neurons in each sub population (ie, 16)
  // genes: (optional) array of Nsp genes (floatArrays) to initialise the network (pretrained);
  var ESPNet = function(Nsp, Ninput, Nhidden, genes) {
    this.net = []; // an array of convnet.js feed forward nn's
    this.Ninput = Ninput;
    this.Nsp = Nsp;
    this.Nhidden = Nhidden;
    this.input = new convnetjs.Vol(1, 1, Nsp+Ninput); // hold most up to date input vector
    this.output = zeros(Nsp);

    // define the architecture of each sub nn:
    var layer_defs = [];
    layer_defs.push({
      type: 'input',
      out_sx: 1,
      out_sy: 1,
      out_depth: (Ninput+Nsp)
    });
    layer_defs.push({
      type: 'fc',
      num_neurons: Nhidden,
      activation: 'sigmoid'
    });
    layer_defs.push({
      type: 'regression',
      num_neurons: 1 // one output for each sub nn, gets fed back into inputs.
    });

    var network;
    for (var i = 0; i < Nsp; i++) {
      network = new convnetjs.Net();
      network.makeLayers(layer_defs);
      this.net.push(network);
    }

    // if pretrained network is supplied:
    if (genes) {
      this.pushGenes(genes);
    }
  };

  ESPNet.prototype = {
    feedback: function() { // feeds output back to last bit of input vector
      var i;
      var Ninput = this.Ninput;
      var Nsp = this.Nsp;
      for (i = 0; i < Nsp; i++) {
        this.input.w[i+Ninput] = this.output[i];
      }
    },
    setInput: function(input) { // input is a vector of length this.Ninput of real numbers
      // this function also grabs the previous most recent output and put it into the internal input vector
      var i;
      var Ninput = this.Ninput;
      var Nsp = this.Nsp;
      for (i = 0; i < Ninput; i++) {
        this.input.w[i] = input[i];
      }
      this.feedback();
    },
    forward: function() { // returns array of output of each Nsp neurons after a forward pass.
      var i, j;
      var Ninput = this.Ninput;
      var Nsp = this.Nsp;
      var y = zeros(Nsp);
      var a; // temp variable to old output of forward pass
      for (i = Nsp-1; i >= 0; i--) {
        if (i === 0) { // for the base network, forward with output of other support networks
          this.feedback();
        }
        a = this.net[i].forward(this.input); // forward pass sub nn # i
        y[i] = a.w[0]; // each sub nn only has one output.
        this.output[i] = y[i]; // set internal output to track output
      }
      return y;
    },
    getNetworkSize: function() { // return total number of weights and biases in a single sub nn.
      return getNetworkSize(this.net[0]); // each network has identical architecture.
    },
    getGenes: function() { // return an array of Nsp genes (floatArrays of length getNetworkSize())
      var i;
      var Nsp = this.Nsp;
      var result = [];
      for (i = 0; i < Nsp; i++) {
        result.push(getGeneFromNetwork(this.net[i]));
      }
      return result;
    },
    pushGenes: function(genes) { // genes is an array of Nsp genes (floatArrays)
      var i;
      var Nsp = this.Nsp;
      for (i = 0; i < Nsp; i++) {
        pushGeneToNetwork(this.net[i], genes[i]);
      }
    }
  };

  // implementation of variation of Enforced Sub Population neuroevolution algorithm
  //
  // options:
  // population_size : population size of each subnetwork inside espnet
  // mutation_rate : [0, 1], when mutation happens, chance of each gene getting mutated
  // elite_percentage : [0, 0.3], only this group mates and produces offsprings
  // mutation_size : positive floating point.  stdev of gausian noise added for mutations
  // target_fitness : after fitness achieved is greater than this float value, learning stops
  // num_passes : number of times each neuron within a sub population is tested
  //          on average, each neuron will be tested num_passes * esp.Nsp times.
  // burst_generations : positive integer.  if best fitness doesn't improve after this number of generations
  //                    then start killing neurons that don't contribute to the bottom line! (reinit them with randoms)
  // best_mode : if true, this will assign each neuron to the best fitness trial it has experienced.
  //             if false, this will use the average of all trials experienced.
  // initGenes:  init Nsp array of floatarray to initialize the chromosomes.  can be result obtained from pretrained sessions.
  var ESPTrainer = function(espnet, options_, initGenes) {

    this.espnet = espnet;
    this.Nsp = espnet.Nsp;
    var Nsp = this.Nsp;

    var options = options_ || {};
    this.population_size = typeof options.population_size !== 'undefined' ? options.population_size : 50;
    this.population_size = Math.floor(this.population_size/2)*2; // make sure even number
    this.mutation_rate = typeof options.mutation_rate !== 'undefined' ? options.mutation_rate : 0.2;
    this.elite_percentage = typeof options.elite_percentage !== 'undefined' ? options.elite_percentage : 0.2;
    this.mutation_size = typeof options.mutation_size !== 'undefined' ? options.mutation_size : 0.02;
    this.target_fitness = typeof options.target_fitness !== 'undefined' ? options.target_fitness : 10000000000000000;
    this.num_passes = typeof options.num_passes !== 'undefined' ? options.num_passes : 2;
    this.burst_generations = typeof options.burst_generations !== 'undefined' ? options.burst_generations : 10;
    this.best_mode = typeof options.best_mode !== 'undefined' ? options.best_mode : false;
    this.chromosome_size = this.espnet.getNetworkSize();

    this.initialize(initGenes);
  };

  ESPTrainer.prototype = {
    initialize: function(initGenes) {
      var i, j;
      var y;
      var Nsp = this.Nsp;
      this.sp = []; // sub populations
      this.bestGenes = []; // array of Nsp number of genes, records the best combination of genes for the bestFitness achieved so far.
      var chromosomes, chromosome;
      for (i = 0; i < Nsp; i++) {
        chromosomes = []; // empty list of chromosomes
        for (j = 0; j < this.population_size; j++) {
          chromosome = new Chromosome(zeros(this.chromosome_size));
          if (initGenes) {
            chromosome.copyFromGene(initGenes[i]);
            if (j > 0) { // don't mutate first guy (pretrained)
              chromosome.burst_mutate(this.mutation_size);
            }
          } else { // push random genes to this.bestGenes since it has not been initalized.
            chromosome.randomize(1.0); // create random gene array if no pretrained one is supplied.
          }
          chromosomes.push(chromosome);
        }
        y = copyFloatArray(chromosomes[0].gene); // y should either be random init gene, or pretrained.
        this.bestGenes.push(y);
        this.sp.push(chromosomes); // push array of chromosomes into each population
      }

      assert(this.bestGenes.length === Nsp);
      this.espnet.pushGenes(this.bestGenes); // initial

      this.bestFitness = -10000000000000000;
      this.bestFitnessCount = 0;
    },
    train: function(fitFunc) { // has to pass in fitness function.  returns best fitness

      var i, j, k, m, N, Nsp;
      var fitness;
      var c = this.sp; // array of arrays that holds every single chromosomes (Nsp x N);
      N = this.population_size; // number of chromosomes in each sub population
      Nsp = this.Nsp; // number of sub populations

      var bestFitness = -10000000000000000;
      var bestSet, bestGenes;
      var cSet;
      var genes;

      // helper function to return best fitness run nTrial times
      var bestFitFunc = function(nTrial, net) {
        var bestFitness = -10000000000000000;
        var fitness;
        for (var i = 0; i < nTrial; i++) {
          fitness = fitFunc(net);
          if (fitness > bestFitness) {
            bestFitness = fitness;
          }
        }
        return bestFitness;
      };

      // helper function to create a new array filled with genes from an array of chromosomes
      // returns an array of Nsp floatArrays
      function getGenesFromChromosomes(s) {
        var g = [];
        for (var i = 0; i < s.length; i++) {
          g.push(copyFloatArray(s[i].gene));
        }
        return g;
      }

      // makes a copy of an array of gene, helper function
      function makeCopyOfGenes(s) {
        var g = [];
        for (var i = 0; i < s.length; i++) {
          g.push(copyFloatArray(s[i]));
        }
        return g;
      }

      // helper function, randomize all of nth sub population of entire chromosome set c
      function randomizeSubPopulation(n, c) {
        for (var i = 0; i < N; i++) {
          c[n][i].randomize(1.0);
        }
      }

      // helper function used to sort the list of chromosomes according to their fitness
      function compareChromosomes(a, b) {
        if ((a.fitness/a.nTrial) > (b.fitness/b.nTrial)) { return -1; }
        if ((a.fitness/a.nTrial) < (b.fitness/b.nTrial)) { return 1; }
        return 0;
      }

      // iterate over each gene in each sub population to initialise the nTrial to zero (will be incremented later)
      for (i = 0; i < Nsp; i++) { // loop over every sub population
        for (j = 0; j < N; j++) {
          if (this.best_mode) { // best mode turned on, no averaging, but just recording best score.
            c[i][j].nTrial = 1;
            c[i][j].fitness = -10000000000000000;
          } else {
            c[i][j].nTrial = 0;
            c[i][j].fitness = 0;
          }
        }
      }

      // see if the global best gene has met target.  if so, can end it now.
      assert(this.bestGenes.length === Nsp);
      this.espnet.pushGenes(this.bestGenes); // put the random set of networks into the espnet
      fitness = fitFunc(this.espnet); // try out this set, and get the fitness
      if (fitness > this.target_fitness) {
        return fitness;
      }
      bestGenes = makeCopyOfGenes(this.bestGenes);
      bestFitness = fitness;
      //this.bestFitness = fitness;

      // for each chromosome in a sub population, choose random chromosomes from all othet sub  populations to
      // build a espnet.  perform fitFunc on that esp net to get the fitness of that combination.  add the fitness
      // to this chromosome, and all participating chromosomes.  increment the nTrial of all participating
      // chromosomes by one, so afterwards they can be sorted by average fitness
      // repeat this process this.num_passes times
      for (k = 0; k < this.num_passes; k++) {
        for (i = 0; i < Nsp; i++) {
          for (j = 0; j < N; j++) {
            // build an array of chromosomes randomly
            cSet = [];
            for (m = 0; m < Nsp; m++) {
              if (m === i) { // push current iterated neuron
                cSet.push(c[m][j]);
              } else { // push random neuron in sub population m
                cSet.push(c[m][randi(0, N)]);
              }
            }
            genes = getGenesFromChromosomes(cSet);
            assert(genes.length === Nsp);
            this.espnet.pushGenes(genes); // put the random set of networks into the espnet

            fitness = fitFunc(this.espnet); // try out this set, and get the fitness

            for (m = 0; m < Nsp; m++) { // tally the scores into each participating neuron
              if (this.best_mode) {
                if (fitness > cSet[m].fitness) { // record best fitness this neuron participated in.
                  cSet[m].fitness = fitness;                
                }
              } else {
                cSet[m].nTrial += 1; // increase participation count for each participating neuron
                cSet[m].fitness += fitness;                
              }
            }
            if (fitness > bestFitness) {
              bestFitness = fitness;
              bestSet = cSet;
              bestGenes = genes;
            }
          }
        }
      }

      // sort the chromosomes by average fitness
      for (i = 0; i < Nsp; i++) {
        c[i] = c[i].sort(compareChromosomes);
      }

      var Nelite = Math.floor(Math.floor(this.elite_percentage*N)/2)*2; // even number
      for (i = 0; i < Nsp; i++) {
        for (j = Nelite; j < N; j+=2) {
          var p1 = randi(0, Nelite);
          var p2 = randi(0, Nelite);
          c[i][p1].crossover(c[i][p2], c[i][j], c[i][j+1]);
        }
      }

      // mutate the population size after 2*Nelite (keep one set of crossovers unmutiliated!)
      for (i = 0; i < Nsp; i++) {
        for (j = 2*Nelite; j < N; j++) {
          c[i][j].mutate(this.mutation_rate, this.mutation_size);
        }
      }

      // put global and local bestgenes in the last element of each gene
      for (i = 0; i < Nsp; i++) {
        c[i][N-1].copyFromGene( this.bestGenes[i] );
        c[i][N-2].copyFromGene( bestGenes[i] );
      }

      if (bestFitness < this.bestFitness) { // didn't beat the record this time
        this.bestFitnessCount++;
        if (this.bestFitnessCount > this.burst_generations) { // stagnation, do burst mutate!
          // add code here when progress stagnates later.
          console.log('stagnating. burst mutate based on best solution.');
          var bestGenesCopy = makeCopyOfGenes(this.bestGenes);
          var bestFitnessCopy = this.bestFitness;
          this.initialize(bestGenesCopy);
          
          this.bestGenes = bestGenesCopy;
          this.bestFitness = this.bestFitnessCopy;
          
        }

      } else {
        this.bestFitnessCount = 0; // reset count for burst
        this.bestFitness = bestFitness; // record the best fitness score
        this.bestGenes = bestGenes; // record the set of genes that generated the best fitness
      }

      // push best one (found so far from all of history, not just this time) to network.
      assert(this.bestGenes.length === Nsp);
      this.espnet.pushGenes(this.bestGenes);

      return bestFitness;
    }
  };

  convnetjs.ESPNet = ESPNet;
  convnetjs.ESPTrainer = ESPTrainer;
  convnetjs.GATrainer = GATrainer;
  convnetjs.Chromosome = Chromosome;
  convnetjs.randomizeNetwork = randomizeNetwork;
})(convnetjs);

