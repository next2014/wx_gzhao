package com.imooc.po;

import java.util.List;

public class NewsMessage extends BaseMessage {
	private int ArticleCount;//图文消息个数
	private List<News> Articles;//多条图文消息信息
	
	public int getArticleCount() {
		return ArticleCount;
	}
	public void setArticleCount(int articleCount) {
		ArticleCount = articleCount;
	}
	public List<News> getArticles() {
		return Articles;
	}
	public void setArticles(List<News> articles) {
		Articles = articles;
	}
	
	

}
