---
layout: post
title: Draw a Tree on Mac
date: 2016-04-24 23:59
author: Gavin
category: blog
tags:
  - C#
  - Mac
slug: draw-a-tree-on-mac
---

Lately I'm on a project with tree relation between some models,
and those relations are store in the database, each row represents a
parent-child link.

It's OK for the code to use but a little unintuitive for us human beings to
understand the tree, for simple ones we can draw that on paper checking row by row,
while for complicated trees, it will cause us ton of time to just visualize the
tree.

And why not make a tool for drawing that tree :D

## Overall

For decoupling, the tool is made up of 2 parts: the backend and the front-end.
Then the font-end can only do the rendering and is replaceable by any other font-end.

## Backend

I plan to not involve detailed logic of the backend and only define the interface
for the front-end to fetch data.

And a sample response from the backend is like:

```json
{
  "id": 1,
  "name": "root",
  "description": "description",
  "children": [
    {
      "id": 2,
      "name": "level1",
      "description": "description",
      "children": [
        {
          "id": 4,
          "name": "level22222",
          "description": "This is level2"
        },
        {
          "id": 5,
          "name": "level222",
          "description": "This is level2",
          "children": [
            {
              "id": 10,
              "name": "level333",
              "description": "Here are a few key resources to get you started with building mobile apps quickly",
              "children": [
                {
                  "id": 11,
                  "name": "level444444",
                  "description": "Introduces Android development. Covers the tool chain, Xamarin.Android projects, and Android fundamentals."
                },
                {
                  "id": 12,
                  "name": "level 4444",
                  "description": "This guide walks through the installation steps and configuration details required to install Xamarin.Android on Windows."
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": 3,
      "name": "level1111",
      "description": "description",
      "children": [
        {
          "id": 6,
          "name": "level2222222",
          "description": "Never know this level: level2, 233333"
        }
      ]
    },
    {
      "id": 3,
      "name": "level111111111",
      "description": "description",
      "children": [
        {
          "id": 7,
          "name": "level22222222222",
          "description": "blahblahblah"
        },
        {
          "id": 8,
          "name": "level222",
          "description": "The AppDelegate.cs file contains our AppDelegate class"
        },
        {
          "id": 9,
          "name": "level two",
          "description": "which is responsible for creating our window and listening to OS events"
        }
      ]
    }
  ]
}
```

It's JSON formatted with the `children` representing the relationship.

# Front-end

This time I try to implement the front-end on Mac using Xamarin.Mac.

[Xamarin](https://www.xamarin.com/platform) is a nice tool for cross-platform development
using C#. And Xamarin.Mac is for developing Mac native app.

Our result is like:

![result](../images/draw-a-tree-on-mac/result.png)

Just create a new solution for our `TreeViewer`. The IDE - Xamarin Studio takes the
advantage of the Xcode to editing storyboard files.

We use a horizon `SplitView` for the main structure. The we draw a text field for
entering root ID, and a draw button the draw the tree.

We should custom a view to draw the actual tree. Let's make it `TreeView`.

The `TreeView` is subclass of the `NSControl` on Cocoa framework.

The key point is calculating the tree size and positions of each nodes/links.

Here, we use `json.NET` to parsing the JSON response and using a generic object
to representing the tree, because the backend may response extra info in node,
so there is no a fixed node class.

The width／height calculation is as follows:

```csharp
private int calcTreeWidth(JObject root) {
    if (root == null) {
        return 0;
    }

    // no children, the leaf node
    if (root ["children"] == null) {
        root.Add (NODE_WIDTH_TAG, NodeWidth);
        return NodeWidth;
    }

    int childrenWidth = 0;
    foreach (var child in root["children"]) {
        childrenWidth += calcTreeWidth (child.Value<JObject>());
    }
    root.Add(NODE_WIDTH_TAG, Math.Max (childrenWidth, NodeWidth));
    return Math.Max (childrenWidth, NodeWidth);
}

private int calcTreeHeight(JObject root) {
	if (root == null) {
		return 0;
	}

	// leaf
	if (root ["children"] == null) {
		root.Add(NODE_HEIGHT_TAG, NodeHeight);
		return NodeHeight;
	}

	int childrenHeight = 0;
	foreach (var child in root["children"]) {
		int height = calcTreeHeight (child.Value<JObject>());
		childrenHeight = Math.Max (height, childrenHeight);
	}
	root.Add (NODE_HEIGHT_TAG, NodeHeight + childrenHeight);
	return NodeHeight + childrenHeight;
}
```

The sum of children's width is the root's width and the height is simply the depth of
the tree.

Along the way, we can store the whole size of the subtree, and we can calculate the positions
of each node later on.

```csharp
private CGPoint calcTreePos (JObject root, CGPoint origin) {
	if (root == null) {
		return origin;
	}

	int width = (int)root [NODE_WIDTH_TAG];
	int height = (int)root [NODE_HEIGHT_TAG];

	// root
	CGPoint rootPos = new CGPoint(origin.X + width / 2, origin.Y + NodeHeight / 2);
	_nodes.Add (rootPos);
	if (root ["children"] != null) {
		var curX = origin.X;
		var curY = origin.Y + NodeHeight;
		foreach (var child in root["children"]) {
			JObject childObj = child.Value<JObject> ();
			CGPoint childPos = calcTreePos(childObj, new CGPoint(curX, curY));
			// add path
			_paths.Add(new Tuple<CGPoint, CGPoint>(rootPos, childPos));
			int childWidth = (int)childObj [NODE_WIDTH_TAG];
			curX += childWidth;
		}
	}

	return rootPos;
}
```

## At last

OK, the tree is very ugly now, more should be done the make it better.