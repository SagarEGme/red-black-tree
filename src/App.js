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
      let tree = this.state.myTreeData;

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
        let currentNode = tree[ 0 ];
        let parentNode = null;
        let grandparentNode = null;
        let direction = null;

        while (currentNode.name !== nullNode) {
          grandparentNode = parentNode;
          parentNode = currentNode;

          if (parseInt(value) > parseInt(currentNode.name)) {
            currentNode = currentNode.children[ 1 ];
            direction = "right";
          } else if (parseInt(value) < parseInt(currentNode.name)) {
            currentNode = currentNode.children[ 0 ];
            direction = "left";
          } else {
            console.log("Value already exists");
            return;
          }
        }

        let newNode = {
          name: value,
          nodeSvgShape: redColor,
          children: [
            { name: nullNode, nodeSvgShape: blackColor },
            { name: nullNode, nodeSvgShape: blackColor },
          ],
        };

        if (direction === "left") {
          parentNode.children[ 0 ] = newNode;
        } else {
          parentNode.children[ 1 ] = newNode;
        }

        currentNode = newNode;

        // Fix violations
        while (parentNode && parentNode.nodeSvgShape === redColor) {
          if (grandparentNode) {
            let isLeftChild = grandparentNode.children[ 0 ] === parentNode;
            let uncle = isLeftChild
              ? grandparentNode.children[ 1 ]
              : grandparentNode.children[ 0 ];

            if (uncle && uncle.nodeSvgShape === redColor) {
              parentNode.nodeSvgShape = blackColor;
              uncle.nodeSvgShape = blackColor;
              grandparentNode.nodeSvgShape = redColor;
              currentNode = grandparentNode;
              parentNode = this.getParent(tree[ 0 ], grandparentNode.name);
              grandparentNode = parentNode ? this.getParent(tree[ 0 ], parentNode.name) : null;
            } else {
              if (isLeftChild) {
                if (currentNode === parentNode.children[ 1 ]) {
                  parentNode = this.leftRotate(parentNode);
                  grandparentNode.children[ 0 ] = parentNode;
                }
                grandparentNode = this.rightRotate(grandparentNode);
              } else {
                if (currentNode === parentNode.children[ 0 ]) {
                  parentNode = this.rightRotate(parentNode);
                  grandparentNode.children[ 1 ] = parentNode;
                }
                grandparentNode = this.leftRotate(grandparentNode);
              }

              parentNode.nodeSvgShape = blackColor;
              grandparentNode.nodeSvgShape = redColor;

              if (!this.getParent(tree[ 0 ], grandparentNode.name)) {
                tree[ 0 ] = parentNode;  // Ensure new root is assigned correctly
              }
            }
          }
        }

        tree[ 0 ].nodeSvgShape = blackColor; // Ensure root remains black
      }

      // 🔥 Ensure tree state updates after insertion
      this.setState({
        input1: '',
        myTreeData: [ ...tree ],  // 🛠 Fix: Spread operator to force React re-render
        forceMount: !this.state.forceMount,
      });

    }
    console.log(JSON.stringify(this.state.myTreeData, null, 2));

  };

  leftRotate = (node, parent) => {
    if (!node.children[ 1 ]) return node;  // Prevent rotating a missing node
    let newRoot = node.children[ 1 ];
    let temp = newRoot.children ? newRoot.children[ 0 ] : null;
    newRoot.children[ 0 ] = node;
    node.children[ 1 ] = temp;
    if (parent) {
      if (parent.children[ 0 ] === node) parent.children[ 0 ] = newRoot;
      else parent.children[ 1 ] = newRoot;
    }
    return newRoot;
  };

  rightRotate = (node, parent) => {
    if (!node.children[ 0 ]) return node;
    let newRoot = node.children[ 0 ];
    let temp = newRoot.children ? newRoot.children[ 1 ] : null;
    newRoot.children[ 1 ] = node;
    node.children[ 0 ] = temp;
    if (parent) {
      if (parent.children[ 0 ] === node) parent.children[ 0 ] = newRoot;
      else parent.children[ 1 ] = newRoot;
    }
    return newRoot;
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
      var tmp = this.state.myTreeData;
      var currentNode = tmp[ 0 ];
      var route = '';
      var isFound = false;
      while (currentNode.name !== nullNode) {
        route += currentNode.name + ', ';
        console.log(currentNode.name);
        currentNode.nodeSvgShape = yellowColor;
        this.setState({
          myTreeData: tmp,
          forceMount: !this.state.forceMount,
        });
        if (parseInt(currentNode.name) === value) {
          isFound = true;
          // alert('Value Found!');
        } else if (parseInt(currentNode.name) > value) {
          currentNode = currentNode.children[ 0 ];
        } else {
          currentNode = currentNode.children[ 1 ];
        }
        if (isFound === true) break;
      }
      if (isFound === false) {
        alert('Value not found!');
      }
      if (route[ route.length - 2 ] === ',') {
        route = route.substring(0, route.length - 2);
      }
      this.setState({
        input2: '',
        searchPath: route,
      });
    }
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