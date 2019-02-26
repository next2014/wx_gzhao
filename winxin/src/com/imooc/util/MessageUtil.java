package com.imooc.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;

import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import com.imooc.po.Image;
import com.imooc.po.ImageMessage;
import com.imooc.po.Music;
import com.imooc.po.MusicMessage;
import com.imooc.po.News;
import com.imooc.po.NewsMessage;
import com.imooc.po.TextMessage;
import com.thoughtworks.xstream.XStream;

public class MessageUtil {
	
	public static final String MESSAGE_TEXT = "text";
	public static final String MESSAGE_NEWS = "news";
	public static final String MESSAGE_IMAGE = "image";
	public static final String MESSAGE_MUSIC = "music";
	public static final String MESSAGE_VOICE = "voice";
	public static final String MESSAGE_VIDEO = "video";
	public static final String MESSAGE_LINK = "link";
	public static final String MESSAGE_LOCATION = "location";
	public static final String MESSAGE_EVENT = "event";
	public static final String MESSAGE_SUBSCRIBE = "subscribe";
	public static final String MESSAGE_UNSUBSCRIBE = "unsubscribe";
	public static final String MESSAGE_CLICK = "CLICK";
	public static final String MESSAGE_VIEW = "VIEW";
	public static final String MESSAGE_SCANCODE = "scancode_push";
	
	/**
	 * xml转为map集合
	 * @param request
	 * @return
	 * @throws IOException
	 * @throws DocumentException
	 */
   public static Map<String, String> xmlToMap(HttpServletRequest request) throws IOException, DocumentException{
	   Map<String, String> map = new HashMap<String,String>();
	   SAXReader reader = new SAXReader();
	   
	   InputStream ins = request.getInputStream();
	   Document doc = reader.read(ins);
	   
	   Element root = doc.getRootElement();
	   
	   List<Element> list = root.elements();
	   
	   for(Element e:list){
		   map.put(e.getName(), e.getText());
	   }
	   ins.close();
	   return map;
   }
   
   /**
    * 将文本消息对象转为xml
    * @param textMessage
    * @return
    */
   public static String textMessageToXml(TextMessage textMessage){
	   XStream xstream = new XStream();
	   xstream.alias("xml", textMessage.getClass());
	   return xstream.toXML(textMessage);
   }
   
   public static String initText(String toUserName,String fromUserName,String content){
	    TextMessage text = new TextMessage();
		text.setFromUserName(toUserName);
		text.setToUserName(fromUserName);
		text.setMsgType(MessageUtil.MESSAGE_TEXT);
		text.setCreateTime(new Date().getTime());
		text.setContent(content);
		return textMessageToXml(text);
   }
   
   /**
    * 主菜单
    * @return
    */
   public static String menuText(){
	   StringBuffer sb = new StringBuffer();
	   sb.append("欢迎您的关注，请按照菜单提示进行操作:\n\n");
	   sb.append("1、课程介绍\n");
	   sb.append("2、慕课网介绍\n\n");
	   sb.append("回复？调出此菜单。");
	   return sb.toString();
   }
   
   public static String firstMenu(){
	   StringBuffer sb = new StringBuffer();
	   sb.append("本套课程介绍微信公众号开发，主要泄及公众号介绍、编辑模式介绍、开发模式介绍等");
	   return sb.toString();
   }
   
   public static String secondMenu(){
	   StringBuffer sb = new StringBuffer();
	   sb.append("慕课网是垂直的互联网IT技能免费学习网站。以独家视频教程、在线编程工具、学习计划、问答社区为核心特色。在这里，你可以找到最好的互联网技术牛人，也可以通过免费的在线公开视频课程学习国内领先的互联网IT技术。");
	   sb.append("慕课网课程涵盖前端开发、PHP、Html5、Android、iOS、Swift等IT前沿技术语言，包括基础课程、实用案例、高级分享三大类型，适合不同阶段的学习人群。以纯干货、短视频的形式为平台特点，为在校学生、职场白领提供了一个迅速提升技能、共同分享进步的学习平台。[1] ");
	   return sb.toString();
   }
   
   /**
    * 图文消息转为xml
    * @param newsMessage
    * @return
    */
   public static String newsMessageToXml(NewsMessage newsMessage){
	   XStream xstream = new XStream();
	   xstream.alias("xml", newsMessage.getClass());
	   xstream.alias("item", new News().getClass());
	   return xstream.toXML(newsMessage);
   }
   
   public static String imageMessageToXml(ImageMessage imageMessage){
	   XStream xstream = new XStream();
	   xstream.alias("xml", imageMessage.getClass());
	   return xstream.toXML(imageMessage);
   }
   
   public static String musicMessageToXml(MusicMessage musicMessage){
	   XStream xstream = new XStream();
	   xstream.alias("xml", musicMessage.getClass());
	   return xstream.toXML(musicMessage);
   }
   
   /**
    * 图文消息的组装
    * @param toUserName
    * @param fromUserName
    * @return
    */
   public static String initNewsMessage(String toUserName,String fromUserName){
	   String message = null;
	   List<News> newsList = new ArrayList<News>();
	   NewsMessage newsMessage = new NewsMessage();
	   
	   News news = new News();
	   news.setTitle("慕课网介绍");
	   news.setDescription("慕课网是垂直的互联网IT技能免费学习网站。以独家视频教程、在线编程工具、学习计划、问答社区为核心特色。在这里，你可以找到最好的互联网技术牛人，也可以通过免费的在线公开视频课程学习国内领先的互联网IT技术。慕课网课程涵盖前端开发、PHP、Html5、Android、iOS、Swift等IT前沿技术语言，包括基础课程、实用案例、高级分享三大类型，适合不同阶段的学习人群。");
	   news.setPicUrl("http://next2018.duapp.com/weixin1/image/imooc.jpg");
	   news.setUrl("www.imooc.com");
	    
	   newsList.add(news);
	   
	   newsMessage.setToUserName(fromUserName);
	   newsMessage.setFromUserName(toUserName);
	   newsMessage.setCreateTime(new Date().getTime());
	   newsMessage.setMsgType(MESSAGE_NEWS);
	   newsMessage.setArticles(newsList);
	   newsMessage.setArticleCount(newsList.size());
	   
	   
	   message = newsMessageToXml(newsMessage);
	   return message;
   }
   
   /**
    * 组装图片消息
    * @param toUserName
    * @param fromUserName
    * @return
    */
   public static String initImageMessage(String toUserName,String fromUserName){
	 String message = null;
	 Image image = new Image();
	 image.setMediaId("lQmSp4mMsqzjYkyXQrdaZXjZqGwA-FBkjd3UczYlw8z4kwE6T8hmQojEFO2cvlpb");
	 ImageMessage imageMessage = new ImageMessage();
	 imageMessage.setFromUserName(toUserName);
	 imageMessage.setToUserName(fromUserName);
	 imageMessage.setMsgType(MESSAGE_IMAGE);
	 imageMessage.setCreateTime(new Date().getTime());
	 imageMessage.setImage(image);
	 message = imageMessageToXml(imageMessage);
	 return message;
   }
   
   /**
    * 组装音乐消息
    * @param toUserName
    * @param fromUserName
    * @return
    */
   public static String initMusicMessage(String toUserName,String fromUserName){
	 String message = null;
	 Music music = new Music();
	 music.setThumbMediaId("EFHSDbgpgwyKAce_rSm6ly9VOEJamPEA6rEjrq1JgzqMNmKfJwphTkbfnbIlMTR9");
	 music.setTitle("see you again");
	 music.setDescription("速7片尾曲");
	 music.setMusicUrl("http://hs7pbj.natappfree.cc/weixin1/resource/See You Again.mp3");
	 music.setHQMusicUrl("http://hs7pbj.natappfree.cc/weixin1/resource/See You Again.mp3");
	 
	 MusicMessage musicMessage = new MusicMessage();
	 musicMessage.setFromUserName(toUserName);
	 musicMessage.setToUserName(fromUserName);
	 musicMessage.setMsgType(MESSAGE_MUSIC);
	 musicMessage.setCreateTime(new Date().getTime());
	 musicMessage.setMusic(music);
	 message = musicMessageToXml(musicMessage);
	 return message;
   }
   
   
   
}
