import React, { Component } from 'react';
import './App.css';
import Tree from 'react-d3-tree';
import { SiLinkedin } from "react-icons/si";
import { BsGithub } from "react-icons/bs";

const containerStyles = {
  width: '100%',
  height: '75vh',
};

const nullNode = 'NIL';

const redColor = {
  shapeProps: {
    shape: 'circle',
    r: 11,
    fill: 'red',
    stroke: 'white',
  },
};

const blackColor = {
  shapeProps: {
    shape: 'circle',
    r: 11,
    fill: 'black',
    stroke: 'white',
  },
};

const yellowColor = {
  shapeProps: {
    shape: 'circle',
    r: 11,
    fill: 'yellow',
    stroke: 'green',
  },
};

class App extends Component {
  state = {
    input1: '',
    input2: '',
    myTreeData: [ { name: nullNode, nodeSvgShape: blackColor } ],
    forceMount: true,
    searchPath: '',
    showDetails: null, // Initialize showDetails as null
    translate: {
      x: 0,
      y: 0,
    },
  };

  valueFound = false;

  componentDidMount() {
    const dimensions = this.treeContainer.getBoundingClientRect(); // it gets the width and height of the tree container referenced below.
    this.setState({
      translate: {
        x: dimensions.width / 2,
        y: dimensions.height / 7,
      },
    });
  }

  insertNode = () => {
    if (this.state.input1 !== '') {
      let value = this.state.input1;
      console.log('Value entered = ' + value);
      let tree = [ ...this.state.myTreeData ]; // Create a deep clone

      if (tree[ 0 ].name === nullNode) {
        tree = [
          {
            name: value,
            nodeSvgShape: blackColor,
            children: [
              { name: nullNode, nodeSvgShape: blackColor },
              { name: nullNode, nodeSvgShape: blackColor },
            ],
          },
        ];
      } else {
        this.insertNodeHelper(tree, value);
      }

      // Ensure tree state updates after insertion
      this.setState({
        input1: '',
        myTreeData: tree,
        forceMount: !this.state.forceMount,
      });
    }
    console.log(JSON.stringify(this.state.myTreeData, null, 2));
  };

  // Helper function to insert a node and fix Red-Black Tree properties
  insertNodeHelper = (tree, value) => {
    let currentNode = tree[ 0 ];
    let path = []; // Track path to insertion point

    // Find insertion point
    while (currentNode.name !== nullNode) {
      path.push(currentNode);
      if (parseInt(value) > parseInt(currentNode.name)) {
        currentNode = currentNode.children[ 1 ];
      } else if (parseInt(value) < parseInt(currentNode.name)) {
        currentNode = currentNode.children[ 0 ];
      } else {
        console.log("Value already exists");
        return; // Value already exists
      }
    }

    // Insert new node
    let newNode = {
      name: value,
      nodeSvgShape: redColor,
      children: [
        { name: nullNode, nodeSvgShape: blackColor },
        { name: nullNode, nodeSvgShape: blackColor },
      ],
    };

    if (path.length === 0) {
      // Tree was empty
      tree[ 0 ] = newNode;
      tree[ 0 ].nodeSvgShape = blackColor; // Root must be black
      return;
    }

    // Connect new node to parent
    let parent = path[ path.length - 1 ];
    if (parseInt(value) < parseInt(parent.name)) {
      parent.children[ 0 ] = newNode;
    } else {
      parent.children[ 1 ] = newNode;
    }

    // Fix Red-Black Tree violations
    this.fixRedBlackTreeViolations(tree, path, newNode);
  };

  // Fix Red-Black Tree violations after insertion
  fixRedBlackTreeViolations = (tree, path, node) => {
    // If node is root, color it black and return
    if (path.length === 0) {
      node.nodeSvgShape = blackColor;
      return;
    }

    // Only need to fix if parent is red
    let parentIndex = path.length - 1;
    let parent = path[ parentIndex ];
    if (parent.nodeSvgShape !== redColor) {
      return;
    }

    // If parent is the root, just make it black
    if (parentIndex === 0) {
      parent.nodeSvgShape = blackColor;
      return;
    }

    let grandparentIndex = parentIndex - 1;
    let grandparent = path[ grandparentIndex ];
    let isParentLeftChild = grandparent.children[ 0 ] === parent;
    let uncle = isParentLeftChild ? grandparent.children[ 1 ] : grandparent.children[ 0 ];

    if (uncle && uncle.nodeSvgShape === redColor) {
      // Case 1: Uncle is red - recolor
      parent.nodeSvgShape = blackColor;
      uncle.nodeSvgShape = blackColor;
      grandparent.nodeSvgShape = redColor;

      this.fixRedBlackTreeViolations(tree, path.slice(0, grandparentIndex), grandparent);
    } else {
      let isNodeInner = (isParentLeftChild && node === parent.children[ 1 ]) ||
        (!isParentLeftChild && node === parent.children[ 0 ]);

      if (isNodeInner) {
        // Case 2: Node is inner grandchild - need to rotate parent first
        if (isParentLeftChild) {
          this.leftRotate(parent);
          parent = node; // After rotation, node becomes new parent
        } else {
          this.rightRotate(parent);
          parent = node; // After rotation, node becomes new parent
        }
        // Update path with new parent
        path[ parentIndex ] = parent;
      }

      // Case 3: Node is outer grandchild (or now outer after Case 2)
      parent.nodeSvgShape = blackColor;
      grandparent.nodeSvgShape = redColor;

      if (isParentLeftChild) {
        this.rightRotate(grandparent);
      } else {
        this.leftRotate(grandparent);
      }

      // If grandparent was the root, update the tree
      if (grandparentIndex === 0) {
        tree[ 0 ] = parent;
      } else {
        // Update the pointer from great-grandparent to parent
        let greatGrandparent = path[ grandparentIndex - 1 ];
        if (greatGrandparent.children[ 0 ] === grandparent) {
          greatGrandparent.children[ 0 ] = parent;
        } else {
          greatGrandparent.children[ 1 ] = parent;
        }
      }
    }
  };

  // Left rotation
  leftRotate = (node) => {
    let rightChild = node.children[ 1 ];
    // Move rightChild's left child to node's right
    node.children[ 1 ] = rightChild.children[ 0 ];
    // Make node the left child of rightChild
    rightChild.children[ 0 ] = node;
    return rightChild;
  };

  // Right rotation
  rightRotate = (node) => {
    let leftChild = node.children[ 0 ];
    // Move leftChild's right child to node's left
    node.children[ 0 ] = leftChild.children[ 1 ];
    // Make node the right child of leftChild
    leftChild.children[ 1 ] = node;
    return leftChild;
  };

  // Find parent helper
  getParent = (root, childName) => {
    if (!root || root.name === nullNode) return null;
    if (
      (root.children[ 0 ] && root.children[ 0 ].name === childName) ||
      (root.children[ 1 ] && root.children[ 1 ].name === childName)
    ) {
      return root;
    }
    return (
      this.getParent(root.children[ 0 ], childName) ||
      this.getParent(root.children[ 1 ], childName)
    );
  };

  searchNode = () => {
    if (this.state.input2 !== '') {
      var value = parseInt(this.state.input2, 10);
      var tmp = JSON.parse(JSON.stringify(this.state.myTreeData)); // Deep clone
      var currentNode = tmp[ 0 ];
      var route = '';
      var isFound = false;

      // Reset previous highlights
      this.resetHighlights(tmp[ 0 ]);

      while (currentNode.name !== nullNode) {
        route += currentNode.name + ', ';
        console.log(currentNode.name);
        currentNode.nodeSvgShape = yellowColor;

        if (parseInt(currentNode.name) === value) {
          isFound = true;
          break;
        } else if (parseInt(currentNode.name) > value) {
          currentNode = currentNode.children[ 0 ];
        } else {
          currentNode = currentNode.children[ 1 ];
        }
      }

      if (isFound === false) {
        alert('Value not found!');
      }

      if (route && route.length >= 2) {
        route = route.substring(0, route.length - 2);
      }

      this.setState({
        input2: '',
        myTreeData: tmp,
        forceMount: !this.state.forceMount,
        searchPath: route,
      });
    }
  };

  // Reset node highlights
  resetHighlights = (node) => {
    if (!node || node.name === nullNode) return;

    // Reset node color based on if it's red or black
    if (node.nodeSvgShape === yellowColor) {
      // Determine original color (this is an approximation, you might need to store the original color)
      node.nodeSvgShape = node.name === 'root' ? blackColor :
        (Math.random() > 0.5 ? redColor : blackColor);
    }

    // Recursively reset children
    this.resetHighlights(node.children[ 0 ]);
    this.resetHighlights(node.children[ 1 ]);
  };

  handleInputChange = name => event => {
    this.setState({
      [ name ]: event.target.value,
    });
  };

  // Function to close the popup
  handleCloseDetails = () => {
    this.setState({
      showDetails: null,
    });
  };

  // Function to show the details based on the type
  handleShowDetails = (detailType) => {
    this.setState({
      showDetails: detailType,
    });
  };

  render() {
    return (
      <div style={containerStyles} ref={tc => (this.treeContainer = tc)}>
        <div style={{ marginTop: -5, height: 61, backgroundColor: '#006633', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ paddingLeft: 10, paddingTop: 10, marginTop: 15, color: '#ffCC33', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: 'red' }}>Red </span>&nbsp; <span style={{ color: 'black' }}> Black &nbsp; </span> Tree Visualization
          </h1>
          <div style={{ position: "absolute", right: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <a href="https://github.com/SagarEGme/red-black-tree" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 20 }}>
              <h1 style={{ color: "yellow" }}>
                <BsGithub />
              </h1>
            </a>
            {/* LinkedIn Link */}
            <a href="https://www.linkedin.com/in/sagar-regmi-5037991a5/" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 10 }}>
              <h1 style={{ color: "yellow" }}>
                <SiLinkedin />
              </h1>
            </a>
          </div>
        </div>

        <br />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <div>
            <input
              style={{ marginLeft: 15, outline: 'none', borderColor: 'transparent', borderBottom: '1px solid blue' }}
              type='text'
              placeholder='Enter a value to be added'
              value={this.state.input1}
              onChange={this.handleInputChange('input1')}
            />
            <button onClick={() => this.insertNode()} style={{ outline: 'none', borderColor: 'gray', borderRadius: '20px', padding: 5, width: 100, marginLeft: 10 }}>
              Insert
            </button>
          </div>
          <div>
            <input
              style={{ marginLeft: 15, outline: 'none', borderColor: 'transparent', borderBottom: '1px solid blue' }}
              type='text'
              placeholder='Enter a value to search for'
              value={this.state.input2}
              onChange={this.handleInputChange('input2')}
            />
            <button onClick={() => this.searchNode()} style={{ outline: 'none', borderColor: 'gray', borderRadius: '20px', padding: 5, width: 100, marginLeft: 10 }}>
              Search
            </button>
            <br />
          </div>
        </div>
        {this.state.searchPath !== '' && (
          <div>
            <br />
            <label style={{ marginLeft: 20 }}> Search path is: {this.state.searchPath}</label>
          </div>
        )}

        {/* Pop-up Details Section */}
        {this.state.showDetails && (
          <div style={popupStyles}>
            <div style={popupContentStyles}>
              <span style={closeIconStyles} onClick={this.handleCloseDetails}>X</span>
              {this.state.showDetails === 'description' && (
                <div>
                  <h3 style={{ color: '#006633' }}>Red-Black Tree Description</h3>
                  <p>Red-Black Trees are a type of self-balancing binary search tree. They ensure that the tree remains balanced while inserting and deleting nodes. They have the following properties:</p>
                  <ul>
                    <li>Every node is either red or black.</li>
                    <li>The root is always black.</li>
                    <li>Red nodes cannot have red children (no two red nodes can be adjacent).</li>
                    <li>Every path from a node to its descendant NULL nodes must have the same number of black nodes.</li>
                  </ul>
                </div>
              )}
              {this.state.showDetails === 'advantages' && (
                <div>
                  <h3 style={{ color: '#006633' }}>Advantages of Red-Black Tree</h3>
                  <ul>
                    <li>Red-Black Trees guarantee balanced height, ensuring logarithmic time for search, insert, and delete operations.</li>
                    <li>They are efficient in terms of memory as they only store color information along with the node data.</li>
                    <li>They provide faster performance than AVL trees in some cases as they require fewer rotations during insertions and deletions.</li>
                    <li>They perform insertion,searching and deletion in TC of 0(logn) in comparion to 0(n) for worst case in BST.</li>
                  </ul>
                </div>
              )}
              {this.state.showDetails === 'disadvantages' && (
                <div>
                  <h3 style={{ color: '#006633' }}>Disadvantages of Red-Black Tree</h3>
                  <ul>
                    <li>Red-Black Trees can have slightly slower insertions and deletions compared to AVL trees because they are less strict about balancing.</li>
                    <li>The balancing mechanism might be harder to implement compared to simpler binary search trees.</li>
                    <li>Less efficent lookups as compared to BST.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <Tree
          data={this.state.myTreeData}
          orientation={'vertical'}
          translate={this.state.translate}
          collapsible={false}
          depthFactor={60}
          key={this.state.forceMount}
        />

        {/* Button Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: 40 }}>
          <div>
            <button onClick={() => this.handleShowDetails('description')} style={buttonStyles}>
              Description
            </button>
            <button onClick={() => this.handleShowDetails('advantages')} style={buttonStyles}>
              Advantages
            </button>
            <button onClick={() => this.handleShowDetails('disadvantages')} style={buttonStyles}>
              Disadvantages
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const buttonStyles = {
  outline: "none",
  borderColor: "gray",
  borderRadius: "20px",
  padding: "10px 20px",
  margin: "0 10px",
  cursor: "pointer",
  backgroundColor: "#006633",
  color: "#fff",
};

const popupStyles = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#D3D3D3",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  zIndex: 1000,
};

const popupContentStyles = {
  position: "relative",
};

const closeIconStyles = {
  position: "absolute",
  top: -5,
  right: 10,
  cursor: "pointer",
  fontSize: "18px",
  fontWeight: "bold",
  color: "red",
};

export default App;