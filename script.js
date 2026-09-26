const topics = [
	{
		name: "Programming Fundamentals",
		path: "./topics/programming-fundamentals/programming-fundamentals.html",
	},
];

const topicsContainer = document.querySelector("#topics");
const topicCount = document.querySelector("#topic-count");

topics.forEach((topic) => {
	const link = document.createElement("a");

	link.href = topic.path;
	link.textContent = topic.name;
	link.className = "topic-card";

	topicsContainer.appendChild(link);
});

topicCount.textContent = `${topics.length} ${
	topics.length === 1 ? "topic" : "topics"
}`;
