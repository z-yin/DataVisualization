import json
import csv

topics = set()      # Original topics.
inds = set()        # Indicators.
topic_dict = {}     # Topic dict.
topic_tree = {}     # Final topic tree.

# Find all the topics.
with open('../data/WDISeries.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    next(reader)    # Skip the header.
    for cols in reader:
        topics.add(cols[1])     # Topic column.
        inds.add(cols[2])       # Indicator column.

        # Generate topic dict.
        sub_topics = cols[1].split(': ')

        # If the root topic is not a key in topic_tree, add it.
        root_topic = sub_topics[0]
        if root_topic not in topic_dict:
            topic_dict[root_topic] = {}

        tmp = topic_dict[root_topic]   # Helper dict.
        for sub_tp in sub_topics[1:-1]:
            if sub_tp not in tmp:
                tmp[sub_tp] = {}
            # Move on to the sub dict.
            tmp = tmp[sub_tp]

        if sub_topics[-1] not in tmp:
            tmp[sub_topics[-1]] = []

        tmp = tmp[sub_topics[-1]]
        # Add leaf nodes.
        tmp.append(cols[2])


# Format topic dict to topic tree (consistent with d3).
def convert_to_tree(name, val):
    if isinstance(val, list):
        tmp = []
        for i in val:
            tmp.append({"name": i})
        return {"name": name, "children": tmp}
    elif isinstance(val, dict):
        val = {"name": name, "children": [
            convert_to_tree(k, val[k]) for k in val]}
    else:
        raise ValueError("Something wrong here.")
    return val


topic_tree = convert_to_tree("topic", topic_dict)

# jsonfile = json.dumps(topic_tree)
# with open("../data/topic_tree.json", "w") as f:
#     f.write(jsonfile)

with open("../data/topics.json", "w") as f:
    f.write(json.dumps({"topics": list(inds)}))
