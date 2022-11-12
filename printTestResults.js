const { traceSubmission  } = require("@usebirch/submission-api");
const { DefaultHttpApiBridge } = require("conjure-client");

const SUBMISSION_SERVICE = new traceSubmission.SubmissionInfoService(new DefaultHttpApiBridge({
    baseUrl: "https://www.learnwithtrace.com/application",
    userAgent: "Trace sample app",
}));

const SUBMISSION_ID_REGEX = /ri.submission..submission.[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/;

async function printTestResults(replayUrl) {
    const submissionId = replayUrl.match(SUBMISSION_ID_REGEX)?.[0];
    if (submissionId == null) {
        throw new Error("Could not parse submission ID.")
    }

    const submission = await SUBMISSION_SERVICE.getSubmissionStateV2(submissionId)
    if (submission.submissionStatus.type !== "test") {
        throw new Error("Submision is not for a graded problem.")
    }

    const numTestsPassed = submission.submissionStatus.test.updates
        .filter(update => {
            if (update.updateInfo.type !== "gradedTestCase") {
                return false;
            }
            return update.updateInfo.gradedTestCase.grade.type === "hidden"
                ? update.updateInfo.gradedTestCase.grade.hidden.passed
                : update.updateInfo.gradedTestCase.grade.nonHidden.passed;
        }).length;

    const numTestCases =  submission.submissionStatus.test.problemInfo.testcases.length;
    console.log(`Passed ${numTestsPassed}/${numTestCases} tests.`)
}

exports.printTestResults = printTestResults