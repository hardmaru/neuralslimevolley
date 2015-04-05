
# Neural Slime Volleyball

HTML5-JS Slime Volleyball clone.  AI agent is a trained recurrent neural network, trained using basic conventional neuroevolution techniques.  Neural network implemented using the [convnetjs](http://cs.stanford.edu/people/karpathy/convnetjs/) library.  It is very difficult to win!

See my blog post at [blog.otoro.net](http://blog.otoro.net/2015/03/28/neural-slime-volleyball/) for more information, or [otoro.net](http://otoro.net/slimevolley/) to actually play the game.

## online demo
- [Neural Slime Volleyball](http://otoro.net/slimevolley)

## Training

If you wish to experiment with adding extra AI modules, or just to see how the learning works, please edit both pro.html and the slimevolley_pro.js.  They are the versions I will use in the future.

Inside pro.html, you can switch on/off the training mode by changing trainingVersion = true/false

If it is running on training version, the most capable neural net, in the form of a JSON array is dumped to nn_gene on the screen every 50 training generations.  You can copy and paste that blob back into initGeneJSON as a quoted text inside slimevolley_pro.js to incorporate back into the game, and switching training mode back to false to play with the new trained network.

Have fun-

## License
GNU GPL v3
