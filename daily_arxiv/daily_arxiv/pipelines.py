# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
import arxiv
import json
import os
import sys
from datetime import datetime, timedelta


class DailyArxivPipeline:
    def __init__(self):
        self.page_size = 100
        self.client = arxiv.Client(self.page_size)

    def extract_affiliations(self, authors):
        affiliations = []
        author_affiliations = []

        for author in authors:
            affiliation = getattr(author, "affiliation", None)
            if not affiliation:
                continue

            affiliation = " ".join(str(affiliation).split())
            if not affiliation:
                continue

            author_affiliations.append({
                "author": author.name,
                "affiliation": affiliation,
            })
            if affiliation not in affiliations:
                affiliations.append(affiliation)

        return affiliations, author_affiliations

    def process_item(self, item: dict, spider):
        item["pdf"] = f"https://arxiv.org/pdf/{item['id']}"
        item["abs"] = f"https://arxiv.org/abs/{item['id']}"
        search = arxiv.Search(
            id_list=[item["id"]],
        )
        paper = next(self.client.results(search))
        authors = list(paper.authors)
        affiliations, author_affiliations = self.extract_affiliations(authors)
        item["authors"] = [a.name for a in authors]
        item["affiliations"] = affiliations
        item["author_affiliations"] = author_affiliations
        item["title"] = paper.title
        item["categories"] = paper.categories
        item["comment"] = paper.comment
        item["summary"] = paper.summary
        return item
