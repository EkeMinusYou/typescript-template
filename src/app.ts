import fs from 'fs';
import {createObjectCsvWriter,} from 'csv-writer';

const tag = 'tag';

main();

async function main():Promise<void> {
  const contents = fs.readFileSync('path/path/mondai.html', 'utf-8');
  const modifiedContents = contents
    .replace(/\r?\n/g,'')
    .replace(/\(正解\)/g, '');

  const questionAndAnswerMatch = /<div class="detailed-result-panel--panel-row--(.+?) detailed-result-panel--question-container--(.+?)"><form class="">(.+?)<\/form><\/div>/g;
  const matched = modifiedContents.match(questionAndAnswerMatch);

  const questions = matched!.map(r => {
    return r
      .replace(/<div class="mc-quiz-question--explanation--(.+?)">.+/, '</form></div>')
      .replace(/<span>質問(.+?): <\/span><span class="mc-quiz-question--skipped--(.+?) label label-default">未回答<\/span>/, '')
      .replace(/<div class="pos-r"><input name="answer" data-index="[0-9]" type="radio" disabled=""><span class="toggle-control-label radio-label">​<\/span><\/div>/g, '')
      .replace(/<div class="pos-r"><input name="answer" data-index="[0-9]" type="checkbox" disabled=""><span class="toggle-control-label checkbox-label">​<\/span><\/div>/g, '')
      .replace(/<p><br><\/p>/g, '');
  });

  const answers = matched!.map(r => {
    const replaced = r
      .replace(/(.+?)<div class="mc-quiz-question--explanation--(.+?)">/, '<div>')
      .replace(/<p><br><\/p>/g, '');
    return '<div><form>' + replaced;
  });

  const csvWriter = createObjectCsvWriter(
    {
      path: './result.csv',
      header: ['question', 'answer', 'id',],
      fieldDelimiter: ',',
    }
  );

  const result = questions.map((question, index) => {
    return {
      question,
      answer: answers[index],
      id: tag + ' ' + String(index + 1),
    };
  });

  await csvWriter.writeRecords(result); // tab区切りに変換してからankiに食わせること
}