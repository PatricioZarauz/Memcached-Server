class InputFormat {
	static basicFormat = [
		"command",
		"key",
		"flags",
		"expTime",
		"bytes",
		"noReply",
	];

	static casFormat = [
		"command",
		"key",
		"flags",
		"expTime",
		"bytes",
		"casUnique",
		"noReply",
	];
}
module.exports = InputFormat;
